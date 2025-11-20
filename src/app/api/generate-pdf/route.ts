import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Set max duration to 60 seconds for Vercel

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
    // Use puppeteer-core with @sparticuz/chromium for serverless
    const chromium = await import('@sparticuz/chromium');
    const puppeteerCore = await import('puppeteer-core');

    // Set the correct path for chromium in Vercel
    if (process.env.VERCEL) {
      // Force chromium to use /tmp directory for extraction on Vercel
      process.env.HOME = '/tmp';
      process.env.FONTCONFIG_PATH = '/tmp';
    }

    // Get executable path - chromium will extract to /tmp automatically
    const executablePath = await chromium.default.executablePath();

    return puppeteerCore.default.launch({
      args: [
        ...chromium.default.args,
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--no-sandbox',
      ],
      executablePath,
      headless: true,
    });
  } // Use regular puppeteer for local development
  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
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

    // Launch Puppeteer browser
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
