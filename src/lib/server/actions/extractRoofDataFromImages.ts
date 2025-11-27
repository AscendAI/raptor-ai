'use server';

import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData, revalidateTaskData } from '@/lib/server/cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';
import { analyseRoofReport } from '@/lib/server/ai/openai';
import { parseRoofReportData } from '@/lib/types/extraction';

// Extract roof data from selected images only; does NOT upload the PDF
export async function extractRoofDataFromImages(
  roofReportImages: string[],
  taskId: string,
  selectedPageIndices?: number[],
  specialInstructions?: string
) {
  try {
    console.log('[extractRoofDataFromImages] Start extraction', {
      taskId,
      imageCount: roofReportImages.length,
      selectedPageIndices,
    });

    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log('[extractRoofDataFromImages] Not authenticated');
      return {
        success: false,
        error: 'Not authenticated',
      } as const;
    }

    const task = await getCachedTaskData(session.user.id, taskId);
    if (!task) {
      console.log('[extractRoofDataFromImages] Task not found:', taskId);
      return {
        success: false,
        error: 'Task not found',
      } as const;
    }

    const structureCount = task.structureCount || 1;
    console.log(
      '[extractRoofDataFromImages] Calling AI with images:',
      roofReportImages.length
    );
    const roofAnalysisRaw = await analyseRoofReport(
      roofReportImages,
      structureCount,
      specialInstructions
    );
    console.log(
      '[extractRoofDataFromImages] Raw AI response length:',
      roofAnalysisRaw?.length || 0
    );

    const roofResult = parseRoofReportData(roofAnalysisRaw);
    console.log(
      '[extractRoofDataFromImages] Parse success:',
      roofResult.success
    );
    if (!roofResult.success) {
      console.log('[extractRoofDataFromImages] Parse error:', roofResult.error);
      return {
        success: false,
        data: roofResult.data,
        error: roofResult.error,
        rawText: roofResult.rawText,
      } as const;
    }

    await upsertTaskData(session.user.id, taskId, {
      roofData: roofResult.data,
      comparison: null,
    });
    revalidateTaskData(taskId);

    console.log('[extractRoofDataFromImages] Saved roof data.');
    return {
      success: roofResult.success,
      data: roofResult.data,
      error: roofResult.error,
      rawText: roofResult.rawText,
    } as const;
  } catch (error) {
    console.error(
      '[extractRoofDataFromImages] Error extracting roof report data:',
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    } as const;
  }
}
