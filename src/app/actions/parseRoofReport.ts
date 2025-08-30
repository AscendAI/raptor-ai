'use server';

import crypto from 'node:crypto';
import { parsePdf } from '@/lib/utils/pdf-helper';
import { parseRoofrPdf } from '@/lib/roofr/parser';
import type { RoofrReportJson } from '@/lib/roofr/types';

// Runtime is defined in next.config.ts now, no need to specify here

export async function parseRoofReportAction(
  formData: FormData
): Promise<
  | { ok: true; documentHash: string; data: RoofrReportJson }
  | { ok: false; error: string }
> {
  try {
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return { ok: false, error: 'No file provided' };
    }

    if (!/\.pdf$/i.test(file.name)) {
      return { ok: false, error: 'File must be a PDF' };
    }

    const buf = Buffer.from(await file.arrayBuffer());

    // Use provided documentHash or compute one from file
    const externalDocHash = (formData.get('documentHash') as string) || '';
    const documentHash =
      externalDocHash || crypto.createHash('sha256').update(buf).digest('hex');

    // Optional metadata passthrough - can be used for persistence later
    // const userId = (formData.get("userId") as string) || "";

    try {
      const parsed = await parsePdf(buf); // -> { text, numpages, info, ... }

      // Validate that PDF content was extracted properly
      if (!parsed.text || parsed.text.trim().length === 0) {
        return {
          ok: false,
          error:
            'Could not extract text from the PDF. The file may be scanned or image-based.',
        };
      }

      if (parsed.numpages === 0) {
        return {
          ok: false,
          error: 'The PDF appears to be empty.',
        };
      }

      const data = parseRoofrPdf(parsed.text, file.name, parsed.numpages);

      // TODO: integrate storage/persistence here if needed:
      // await saveFile(buf, documentHash)
      // await saveJson(data, `${documentHash}.json`)

      return { ok: true, documentHash, data };
    } catch (parseErr: Error | unknown) {
      const errorMessage =
        parseErr instanceof Error ? parseErr.message : 'Unknown parsing error';
      return {
        ok: false,
        error: `PDF parsing failed: ${errorMessage}`,
      };
    }
  } catch (err: Error | unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to parse PDF';
    return { ok: false, error: errorMessage };
  }
}
