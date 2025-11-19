/**
 * Better PDF export utility using browser's native print functionality
 * This is more reliable than html2canvas + jsPDF approach
 */

export interface PrintToPDFOptions {
  filename?: string;
  onBeforePrint?: () => void | Promise<void>;
  onAfterPrint?: () => void | Promise<void>;
}

/**
 * Export content to PDF using browser's native print dialog
 * This is the most reliable way to generate PDFs from HTML
 */
export async function printToPDF(
  element: HTMLElement,
  options: PrintToPDFOptions = {}
): Promise<void> {
  const { filename = 'report.pdf', onBeforePrint, onAfterPrint } = options;

  try {
    // Execute any pre-print setup
    if (onBeforePrint) {
      await onBeforePrint();
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error(
        'Failed to open print window. Please check your popup blocker settings.'
      );
    }

    // Clone the element and its styles
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Get all stylesheets from the current document
    const styleSheets = Array.from(document.styleSheets);
    const styles = styleSheets
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (e) {
          // Skip external stylesheets that can't be accessed due to CORS
          console.warn('Could not access stylesheet:', e);
          return '';
        }
      })
      .join('\n');

    // Create print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            ${styles}
            
            /* Additional print-specific styles */
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${clonedElement.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load
    await new Promise<void>((resolve) => {
      printWindow.onload = () => {
        // Small delay to ensure all resources are loaded
        setTimeout(() => resolve(), 500);
      };
      // Fallback in case onload doesn't fire
      setTimeout(() => resolve(), 1000);
    });

    // Trigger print dialog
    printWindow.print();

    // Clean up after printing
    const cleanup = () => {
      printWindow.close();
      if (onAfterPrint) {
        onAfterPrint();
      }
    };

    // Listen for print completion
    printWindow.onafterprint = cleanup;
    // Fallback cleanup after 1 second
    setTimeout(cleanup, 1000);
  } catch (error) {
    console.error('Error printing to PDF:', error);
    if (onAfterPrint) {
      await onAfterPrint();
    }
    throw error;
  }
}

/**
 * Alternative: Direct browser print (simpler approach)
 * Opens the print dialog directly without creating a new window
 */
export function directPrint(): void {
  window.print();
}

/**
 * Prepare element for PDF export by expanding collapsible sections
 */
export function prepareForPDFExport(element: HTMLElement): () => void {
  const cleanup: Array<() => void> = [];

  // Find and expand all accordion items
  const accordionTriggers = element.querySelectorAll(
    'button[data-state="closed"][data-slot="accordion-trigger"]'
  );
  accordionTriggers.forEach((trigger) => {
    const button = trigger as HTMLElement;
    button.click();
    cleanup.push(() => {
      if (button.getAttribute('data-state') === 'open') {
        button.click();
      }
    });
  });

  // Find and expand all collapsible sections
  const collapsibleTriggers = element.querySelectorAll(
    '[data-state="closed"][data-collapsible-trigger]'
  );
  collapsibleTriggers.forEach((trigger) => {
    const button = trigger as HTMLElement;
    button.click();
    cleanup.push(() => {
      if (button.getAttribute('data-state') === 'open') {
        button.click();
      }
    });
  });

  // Return cleanup function
  return () => {
    cleanup.forEach((fn) => fn());
  };
}

/**
 * Hide elements from PDF export by adding data-no-print attribute
 */
export function markNoPrint(selectors: string[]): void {
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      el.setAttribute('data-no-print', 'true');
    });
  });
}
