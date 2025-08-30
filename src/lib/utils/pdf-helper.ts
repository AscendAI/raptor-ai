/**
 * Custom wrapper for pdf-parse to handle the test file issues
 */
import pdfParseOriginal from 'pdf-parse/lib/pdf-parse.js';
import type { PDFParseResult } from 'pdf-parse';

/**
 * Parse PDF buffer to text
 */
export async function parsePdf(
  pdfBuffer: Buffer,
  options?: Record<string, unknown>
): Promise<PDFParseResult> {
  try {
    // Add options to ignore the default test file lookup
    const mergedOptions = {
      // Prevent test file lookup that causes ENOENT errors
      testMode: false,
      ...options,
    };

    return await pdfParseOriginal(pdfBuffer, mergedOptions);
  } catch (error) {
    // Handle common errors with helpful messages
    if (error instanceof Error) {
      // Test file not found error
      if (
        error.message.includes('ENOENT') &&
        error.message.includes('./test/data')
      ) {
        throw new Error(
          'PDF parsing error: Test file not found. This is likely an internal pdf-parse library issue.'
        );
      }

      // PDF format error
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error(
          'The uploaded file is not a valid PDF or is corrupted.'
        );
      }

      // Password protected PDF
      if (error.message.includes('password')) {
        throw new Error(
          'The PDF is password protected. Please provide an unprotected PDF.'
        );
      }
    }

    // Rethrow any other errors
    throw error;
  }
}
