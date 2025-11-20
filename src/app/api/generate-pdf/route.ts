import { NextRequest, NextResponse } from 'next/server';

// We purposely rely on the regular node runtime (not edge) because Puppeteer
// requires native binaries.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set max duration to 60 seconds for Vercel

// Minimal shape we rely on from @sparticuz/chromium
type ChromiumLike = {
  args: string[];
  executablePath?: (() => Promise<string | null>) | string | null;
  headless?: boolean;
};

/**
 * Launch Puppeteer browser with appropriate configuration
 * Automatically detects serverless environment (Vercel, AWS Lambda)
 */
async function launchBrowser() {
  const isServerless =
    !!process.env.VERCEL ||
    !!process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    !!process.env.AWS_REGION;

  if (isServerless) {
    // Use puppeteer-core with @sparticuz/chromium for serverless (Vercel, AWS Lambda, etc.)
    const chromiumMod = (await import('@sparticuz/chromium')) as unknown as
      | (ChromiumLike & { default?: ChromiumLike })
      | { default: ChromiumLike };
    // Standardize default vs named export
    const chromium: ChromiumLike =
      (chromiumMod as { default?: ChromiumLike }).default ??
      (chromiumMod as ChromiumLike);
    const puppeteerCore = await import('puppeteer-core');

    // Some environments may supply a manual override path (e.g. for debugging)
    const manualPath = process.env.CHROMIUM_PATH;

    // Resolve executable path. Newer versions expose a function; fallback to property; lastly manual override.
    let executablePath: string | undefined | null;
    try {
      if (typeof chromium.executablePath === 'function') {
        executablePath = await chromium.executablePath();
      } else if (typeof chromium.executablePath === 'string') {
        executablePath = chromium.executablePath;
      }
    } catch (e) {
      console.warn(
        'chromium.executablePath() threw, will attempt manual/path fallback:',
        e
      );
    }

    if (!executablePath && manualPath) {
      executablePath = manualPath;
    }

    if (!executablePath) {
      // Fail early with actionable message instead of obscure brotli/bin error later.
      throw new Error(
        'Chromium executable path could not be resolved. Ensure @sparticuz/chromium is bundled (do NOT externalize) and deployment completed. Optionally set CHROMIUM_PATH.'
      );
    }

    console.log(
      'Launching puppeteer-core with executablePath:',
      executablePath
    );

    return puppeteerCore.default.launch({
      args: [...chromium.args, '--disable-dev-shm-usage'],
      executablePath,
      headless: true, // Always headless in serverless to minimize resources
      defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
    });
  }

  // Local development: use full puppeteer which downloads a Chrome binary automatically
  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
    defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
  });
}

/**
 * Server-side PDF generation using Puppeteer
 * This generates pixel-perfect PDFs of the report template
 * Works in both development and production (Vercel) environments
 */
export async function POST(request: NextRequest) {
  let browser;

  try {
    // Parse request body
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Determine environment
    const isServerless =
      !!process.env.VERCEL ||
      !!process.env.AWS_LAMBDA_FUNCTION_VERSION ||
      !!process.env.AWS_REGION;

    console.log(
      'PDF Generation: Environment:',
      isServerless ? 'serverless' : 'local'
    );

    // Launch Puppeteer browser (serverless-safe)
    browser = await launchBrowser();

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2, // High DPI for crisp text
    });

    // Set content with full HTML structure
    await page.setContent(html, {
      waitUntil: 'networkidle0', // Wait for all resources to load
      timeout: 30000,
    });

    // Wait a bit for any animations to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate PDF with high quality settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    });

    // Close browser
    await browser.close();

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'report.pdf'}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);

    // Clean up browser if it's still running
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
