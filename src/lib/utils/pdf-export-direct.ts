import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DirectPDFExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Enhanced PDF export that directly downloads a high-quality PDF
 * This version uses optimized settings for better reliability
 */
export async function exportToPDFDirect(
  element: HTMLElement,
  options: DirectPDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'report.pdf',
    quality = 0.98,
    scale = 2,
    onProgress,
  } = options;

  try {
    // Step 1: Prepare content
    onProgress?.(10, 'Preparing content...');

    // Show all content by expanding accordions
    const accordionCleanup = expandAllAccordions(element);

    // Small delay to let animations complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    onProgress?.(20, 'Cloning element...');

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = element.offsetWidth + 'px';
    document.body.appendChild(clone);

    // Apply computed styles to ensure accurate rendering
    onProgress?.(30, 'Applying styles...');
    await applyComputedStyles(element, clone);

    // Create high-quality canvas
    onProgress?.(40, 'Rendering content...');
    const canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000,
      removeContainer: true,
      // Optimize for better rendering
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.querySelector(
          '[style*="left: -9999px"]'
        ) as HTMLElement;
        if (clonedElement) {
          clonedElement.style.left = '0';
          clonedElement.style.position = 'relative';

          // Remove any fixed/sticky positioning
          const fixedElements = clonedElement.querySelectorAll('*');
          fixedElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computed = window.getComputedStyle(htmlEl);
            if (
              computed.position === 'fixed' ||
              computed.position === 'sticky'
            ) {
              htmlEl.style.position = 'relative';
            }
          });
        }
      },
    });

    // Remove clone
    document.body.removeChild(clone);

    // Restore accordion states
    accordionCleanup();

    // Convert canvas to PDF
    onProgress?.(70, 'Creating PDF...');
    const imgData = canvas.toDataURL('image/jpeg', quality);

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Calculate image dimensions to fit A4
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Create PDF
    onProgress?.(80, 'Generating pages...');
    const pdf = new jsPDF({
      orientation: imgHeight > pdfWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = pdfHeight;

    // Add first page
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;
    }

    // Download the PDF
    onProgress?.(95, 'Saving file...');
    pdf.save(filename);

    onProgress?.(100, 'Complete!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Expand all accordion items for complete PDF export
 */
function expandAllAccordions(element: HTMLElement): () => void {
  const closedTriggers: HTMLElement[] = [];

  // Find all closed accordion triggers
  element.querySelectorAll('[data-state="closed"]').forEach((trigger) => {
    const button = trigger as HTMLElement;
    if (button.hasAttribute('data-slot') || button.closest('[role="button"]')) {
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

/**
 * Apply computed styles from source to clone for accurate rendering
 */
async function applyComputedStyles(
  source: HTMLElement,
  clone: HTMLElement
): Promise<void> {
  const sourceElements = source.querySelectorAll('*');
  const cloneElements = clone.querySelectorAll('*');

  sourceElements.forEach((sourceEl, index) => {
    const cloneEl = cloneElements[index] as HTMLElement;
    if (!cloneEl) return;

    const computed = window.getComputedStyle(sourceEl);

    // Copy critical styles
    const criticalStyles = [
      'color',
      'backgroundColor',
      'fontSize',
      'fontWeight',
      'fontFamily',
      'lineHeight',
      'padding',
      'margin',
      'border',
      'borderRadius',
      'display',
      'width',
      'height',
      'textAlign',
    ];

    criticalStyles.forEach((prop) => {
      try {
        const value = computed.getPropertyValue(
          prop.replace(/([A-Z])/g, '-$1').toLowerCase()
        );
        if (value) {
          cloneEl.style.setProperty(
            prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
            value,
            'important'
          );
        }
      } catch {
        // Ignore errors
      }
    });
  });
}
