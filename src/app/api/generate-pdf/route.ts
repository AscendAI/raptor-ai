import { NextRequest, NextResponse } from 'next/server';

// Node.js runtime required (not edge) because Puppeteer needs native binaries

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set max duration to 60 seconds for Vercel

// Minimal shape we rely on from @sparticuz/chromium
type ChromiumLike = {
  args: string[];
  executablePath?: (() => Promise<string | null>) | string | null;
  headless?: boolean;
  defaultViewport?: { width: number; height: number } | null;
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
    // Production/serverless: puppeteer-core + @sparticuz/chromium
    const mod = (await import('@sparticuz/chromium')) as unknown as
      | (ChromiumLike & { default?: ChromiumLike })
      | { default: ChromiumLike };
    const chromium: ChromiumLike =
      (mod as { default?: ChromiumLike }).default ?? (mod as ChromiumLike);
    const puppeteerCore = await import('puppeteer-core');

    // Recommended toggles per @sparticuz/chromium docs to reduce missing lib issues
    // (setGraphicsMode false avoids GPU related shared object requirements)
    // These properties exist on the default export; guard in case of shape differences.
    const executablePath =
      typeof chromium.executablePath === 'function'
        ? await chromium.executablePath()
        : chromium.executablePath || undefined;

    if (!executablePath) {
      throw new Error('Unable to resolve chromium executablePath');
    }

    console.log('Launching serverless chromium at path:', executablePath);

    const viewport =
      chromium.defaultViewport &&
      typeof chromium.defaultViewport.width === 'number' &&
      typeof chromium.defaultViewport.height === 'number'
        ? chromium.defaultViewport
        : { width: 1200, height: 1600 };

    return puppeteerCore.default.launch({
      args: chromium.args,
      executablePath,
      headless: true,
      defaultViewport: viewport,
    });
  }

  // Local development: full puppeteer (downloads local Chrome)
  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
    defaultViewport: { width: 1200, height: 1600 },
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

    browser = await launchBrowser();

    const page = await browser.newPage();

    // Optional explicit viewport (already set in launch for serverless)
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

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
