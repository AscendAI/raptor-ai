import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore, { Browser } from 'puppeteer-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds

// Cached between invocations in a warm Lambda
let cachedBrowser: Browser | null = null;
let cachedExecutablePath: string | null = null;

const VIEWPORT = {
  width: 1200,
  height: 1600,
  deviceScaleFactor: 2,
};

function isServerlessProd() {
  return !!process.env.VERCEL || process.env.NODE_ENV === 'production';
}

async function getExecutablePath() {
  if (cachedExecutablePath) return cachedExecutablePath;

  // Prefer explicit env; else assume the pack is in /public of this app
  const packUrl =
    process.env.CHROMIUM_PACK_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/chromium-pack.tar`
      : 'http://localhost:3000/chromium-pack.tar');

  cachedExecutablePath = await chromium.executablePath(packUrl);
  return cachedExecutablePath;
}

async function getBrowser(): Promise<Browser> {
  if (cachedBrowser) {
    try {
      await cachedBrowser.version();
      return cachedBrowser;
    } catch {
      cachedBrowser = null;
    }
  }

  if (isServerlessProd()) {
    // use const assertion to satisfy eslint @typescript-eslint/prefer-as-const
    const headless = 'shell' as const;

    const browser = await puppeteerCore.launch({
      args: puppeteerCore.defaultArgs({
        args: chromium.args,
        headless,
      }),
      defaultViewport: VIEWPORT,
      executablePath: await getExecutablePath(),
      headless,
    });

    cachedBrowser = browser;
    return browser;
  }

  // Local dev: full Puppeteer with bundled Chrome
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: VIEWPORT,
  });

  cachedBrowser = browser;
  return browser;
}

/**
 * POST /api/pdf
 * Body: { html: string, filename?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();

    if (!html || typeof html !== 'string') {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    const safeFilename =
      typeof filename === 'string' && filename.trim()
        ? filename.trim()
        : 'report.pdf';

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport(VIEWPORT);

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    });

    // Give layout/animations a moment to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Puppeteer returns a Uint8Array
    const pdfBytes = await page.pdf({
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

    await page.close();

    // Wrap the bytes in a Blob (valid BodyInit)
    // Create a new Uint8Array copy backed by a standard ArrayBuffer to satisfy BlobPart typing.
    const uint8 = new Uint8Array(pdfBytes);
    const pdfBlob = new Blob([uint8], { type: 'application/pdf' });

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
