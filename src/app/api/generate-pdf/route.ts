/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

async function launchBrowser() {
  const isServerless =
    !!process.env.VERCEL ||
    !!process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    !!process.env.AWS_REGION;

  if (isServerless) {
    const remotePack =
      process.env.CHRONIUM_REMOTE_EXEC_PATH || // typo-safe
      process.env.CHROMIUM_REMOTE_EXEC_PATH;

    if (!remotePack) {
      throw new Error(
        'CHROMIUM_REMOTE_EXEC_PATH is not set. It must point to chromium-v141.0.0-pack.x64.tar'
      );
    }

    // chromium-min runtime is fine, TS typings are annoying → cast to any

    const chr = chromium as any;

    const executablePath: string = await chr.executablePath(remotePack);
    if (!executablePath) {
      throw new Error(
        'chromium.executablePath() returned null. Check CHROMIUM_REMOTE_EXEC_PATH.'
      );
    }

    return puppeteerCore.launch({
      args: [...chr.args, '--disable-dev-shm-usage'],
      executablePath,
      // these exist at runtime, but TS doesn’t know → from `chr` (any)
      defaultViewport: chr.defaultViewport,
      headless: chr.headless ?? 'shell',
    });
  }

  // Local dev: full puppeteer with your local Chrome/Chromium
  const puppeteer = await import('puppeteer');
  return puppeteer.default.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
}

export async function POST(request: NextRequest) {
  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;

  try {
    const { html, filename } = await request.json();

    if (!html || typeof html !== 'string') {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    const safeFilename = (filename || 'report.pdf').replace(/["\r\n]/g, '');

    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // small delay for layout/animations to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force into a Node Buffer so we control the type
    const pdfUint8 = await page.pdf({
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

    const pdfBuffer = Buffer.from(pdfUint8); // <– now clearly a Buffer

    await browser.close();
    browser = null;

    // TS is picky about BodyInit; Buffer is valid at runtime → cast
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);

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
