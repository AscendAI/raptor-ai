/**
 * Server-side PDF generation using Puppeteer
 * This provides pixel-perfect PDF export by rendering on the server
 */

export interface ServerPDFExportOptions {
  filename?: string;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Generate PDF using server-side Puppeteer rendering
 * This captures exactly what you see in the preview dialog
 */
export async function generatePDFServerSide(
  element: HTMLElement,
  options: ServerPDFExportOptions = {}
): Promise<void> {
  const { filename = 'report.pdf', onProgress } = options;

  try {
    onProgress?.(10, 'Preparing content...');

    // Get all stylesheets from the document
    const styleSheets = Array.from(document.styleSheets);
    let styles = '';

    // Extract CSS from all stylesheets
    styleSheets.forEach((styleSheet) => {
      try {
        const rules = Array.from(styleSheet.cssRules);
        rules.forEach((rule) => {
          styles += rule.cssText + '\n';
        });
      } catch (e) {
        // Skip stylesheets we can't access (CORS)
        console.warn('Could not access stylesheet:', e);
      }
    });

    onProgress?.(20, 'Collecting styles...');

    // Get all external stylesheets
    const linkTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    );
    const styleTags = linkTags
      .map(
        (link) =>
          `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`
      )
      .join('\n');

    onProgress?.(30, 'Building HTML...');

    // Build complete HTML document
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${filename}</title>
          ${styleTags}
          <style>
            ${styles}
            
            /* Additional print-specific styles */
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
            
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            
            /* Ensure proper rendering */
            .pdf-report-template {
              width: 100%;
              max-width: none;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;

    onProgress?.(50, 'Sending to server...');

    // Send HTML to server for PDF generation
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        filename,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate PDF');
    }

    onProgress?.(80, 'Receiving PDF...');

    // Get PDF blob
    const blob = await response.blob();

    onProgress?.(90, 'Downloading...');

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onProgress?.(100, 'Complete!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Expand all accordions before PDF generation
 */
export function expandAllAccordions(element: HTMLElement): () => void {
  const closedTriggers: HTMLElement[] = [];

  // Find all closed accordion triggers
  element.querySelectorAll('[data-state="closed"]').forEach((trigger) => {
    const button = trigger as HTMLElement;
    if (
      button.hasAttribute('data-slot') ||
      button.getAttribute('role') === 'button'
    ) {
      closedTriggers.push(button);
      button.click();
    }
  });

  // Return cleanup function
  return () => {
    closedTriggers.forEach((trigger) => {
      if (trigger.getAttribute('data-state') === 'open') {
        trigger.click();
      }
    });
  };
}
