import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Export HTML element to PDF with high quality rendering
 * @param element - The HTML element to convert to PDF
 * @param options - Export options
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = 'report.pdf', quality = 2, scale = 2 } = options;

  try {
    // Create canvas from HTML element with high quality settings
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      // Ignore elements that might cause issues
      ignoreElements: (element) => {
        // Ignore elements with data-html2canvas-ignore attribute
        return element.hasAttribute('data-html2canvas-ignore');
      },
      // Handle CSS parsing errors gracefully by converting all colors to RGB
      onclone: (clonedDoc) => {
        // Remove all link stylesheets to prevent CSS parsing
        const stylesheets = clonedDoc.querySelectorAll(
          'link[rel="stylesheet"], style'
        );
        stylesheets.forEach((sheet) => sheet.remove());

        // Get all elements in both documents
        const allClonedElements = clonedDoc.querySelectorAll('*');
        const allOriginalElements = element.ownerDocument.querySelectorAll('*');

        // Apply computed styles inline to avoid CSS parsing issues
        allClonedElements.forEach((el, index) => {
          const htmlEl = el as HTMLElement;
          const originalEl = allOriginalElements[index];

          if (originalEl && originalEl instanceof HTMLElement) {
            try {
              const computedStyle = window.getComputedStyle(originalEl);

              // Apply all critical computed styles inline
              const criticalStyles = [
                'color',
                'backgroundColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
                'borderTopWidth',
                'borderRightWidth',
                'borderBottomWidth',
                'borderLeftWidth',
                'borderTopStyle',
                'borderRightStyle',
                'borderBottomStyle',
                'borderLeftStyle',
                'borderRadius',
                'padding',
                'paddingTop',
                'paddingRight',
                'paddingBottom',
                'paddingLeft',
                'margin',
                'marginTop',
                'marginRight',
                'marginBottom',
                'marginLeft',
                'fontSize',
                'fontWeight',
                'fontFamily',
                'lineHeight',
                'textAlign',
                'display',
                'width',
                'height',
                'maxWidth',
                'maxHeight',
                'minWidth',
                'minHeight',
                'position',
                'top',
                'right',
                'bottom',
                'left',
                'flexDirection',
                'justifyContent',
                'alignItems',
                'gap',
                'gridTemplateColumns',
                'gridTemplateRows',
                'gridGap',
              ];

              criticalStyles.forEach((prop) => {
                const value = computedStyle.getPropertyValue(
                  prop.replace(/([A-Z])/g, '-$1').toLowerCase()
                );
                if (value && value !== 'none' && value !== 'auto') {
                  htmlEl.style.setProperty(
                    prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
                    value,
                    'important'
                  );
                }
              });
            } catch {
              // Silently ignore any errors
            }
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/png', quality);
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Initialize PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(
      imgData,
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate PDF: ${errorMessage}`);
  }
}

// Helper function to expand all accordion items for PDF export
export function expandAllAccordions(element: HTMLElement): () => void {
  // Find all Radix UI accordion triggers that are closed
  const closedTriggers = Array.from(
    element.querySelectorAll('button[data-state="closed"]')
  ).filter((trigger) => {
    // Make sure it's an accordion trigger
    return trigger.getAttribute('data-slot') === 'accordion-trigger';
  }) as HTMLElement[];

  // Click all closed triggers to expand them
  closedTriggers.forEach((trigger) => {
    trigger.click();
  });

  // Return cleanup function to restore original state
  return () => {
    closedTriggers.forEach((trigger) => {
      // Check if it's still open before clicking to close
      if (trigger.getAttribute('data-state') === 'open') {
        trigger.click();
      }
    });
  };
}

/**
 * Export multiple HTML elements as separate pages in a single PDF
 * @param elements - Array of HTML elements to convert
 * @param options - Export options
 */
export async function exportMultipleToPDF(
  elements: HTMLElement[],
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = 'report.pdf', quality = 2, scale = 2 } = options;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        // Ignore elements that might cause issues
        ignoreElements: (element) => {
          return element.hasAttribute('data-html2canvas-ignore');
        },
        // Handle CSS parsing errors gracefully
        onclone: (clonedDoc) => {
          // Remove all link stylesheets to prevent CSS parsing
          const stylesheets = clonedDoc.querySelectorAll(
            'link[rel="stylesheet"], style'
          );
          stylesheets.forEach((sheet) => sheet.remove());

          const allClonedElements = clonedDoc.querySelectorAll('*');
          const allOriginalElements =
            element.ownerDocument.querySelectorAll('*');

          allClonedElements.forEach((el, index) => {
            const htmlEl = el as HTMLElement;
            const originalEl = allOriginalElements[index];

            if (originalEl && originalEl instanceof HTMLElement) {
              try {
                const computedStyle = window.getComputedStyle(originalEl);

                const criticalStyles = [
                  'color',
                  'backgroundColor',
                  'borderTopColor',
                  'borderRightColor',
                  'borderBottomColor',
                  'borderLeftColor',
                  'borderTopWidth',
                  'borderRightWidth',
                  'borderBottomWidth',
                  'borderLeftWidth',
                  'borderTopStyle',
                  'borderRightStyle',
                  'borderBottomStyle',
                  'borderLeftStyle',
                  'borderRadius',
                  'padding',
                  'paddingTop',
                  'paddingRight',
                  'paddingBottom',
                  'paddingLeft',
                  'margin',
                  'marginTop',
                  'marginRight',
                  'marginBottom',
                  'marginLeft',
                  'fontSize',
                  'fontWeight',
                  'fontFamily',
                  'lineHeight',
                  'textAlign',
                  'display',
                  'width',
                  'height',
                  'maxWidth',
                  'maxHeight',
                  'minWidth',
                  'minHeight',
                  'position',
                  'top',
                  'right',
                  'bottom',
                  'left',
                  'flexDirection',
                  'justifyContent',
                  'alignItems',
                  'gap',
                  'gridTemplateColumns',
                  'gridTemplateRows',
                  'gridGap',
                ];

                criticalStyles.forEach((prop) => {
                  const value = computedStyle.getPropertyValue(
                    prop.replace(/([A-Z])/g, '-$1').toLowerCase()
                  );
                  if (value && value !== 'none' && value !== 'auto') {
                    htmlEl.style.setProperty(
                      prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
                      value,
                      'important'
                    );
                  }
                });
              } catch {
                // Silently ignore any errors
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png', quality);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        imgData,
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pageHeight;
      }
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate PDF: ${errorMessage}`);
  }
}
