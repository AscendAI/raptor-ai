import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

// NOTE: @sparticuz/chromium version must be compatible with the Vercel/Lambda environment.
// Currently using v131.0.1 with puppeteer-core v23.11.1 to avoid libnss3.so errors.

// Node.js runtime (not edge) required because Puppeteer needs native binaries
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

async function launchBrowser() {
  const isServerless =
    !!process.env.VERCEL ||
    !!process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    !!process.env.AWS_REGION;

  if (isServerless) {
    // Set required environment variables for Vercel/Lambda
    process.env.HOME = '/tmp';
    process.env.FONTCONFIG_PATH = '/tmp';

    const executablePath = await chromium.executablePath();
    if (!executablePath)
      throw new Error('Unable to resolve chromium executablePath');
    console.log('Serverless chromium path:', executablePath);

    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 1600 },
      executablePath,
      headless: true,
    });
  }

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

    // Explicit viewport (ensures consistent PDF layout in both envs)
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
