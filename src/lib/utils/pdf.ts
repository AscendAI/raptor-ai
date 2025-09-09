/**
 * Utility functions for PDF processing
 */

/**
 * Reads file data as base64 data URL
 */
function readFileData(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result || null);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a PDF file to an array of base64-encoded images
 * @param file - The PDF file to convert
 * @returns Promise<string[]> - Array of base64-encoded images
 */
export async function convertPdfToImages(file: File): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  const images: string[] = [];

  const data = await readFileData(file);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = await pdfjs.getDocument(data as any).promise;
  const canvas = document.createElement('canvas');

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1 });
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport, canvas })
      .promise;
    images.push(canvas.toDataURL());
  }

  canvas.remove();
  return images;
}
