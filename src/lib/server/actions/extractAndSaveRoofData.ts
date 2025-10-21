'use server';

import { analyseRoofReport } from '../ai/openai';
import { parseRoofReportData } from '../../types/extraction';
import { uploadFile, deleteFiles } from '../uploadthing';
import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData, revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';

// Extract roof report data only
export async function extractAndSaveRoofData(
  roofReportImages: string[],
  taskId: string,
  roofReport: File
) {
  try {
    console.log('Extracting roof report data...');
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const task = await getCachedTaskData(session.user.id, taskId);
    if (!task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    const structureCount = task.structureCount || 1;
    const roofAnalysisRaw = await analyseRoofReport(roofReportImages, structureCount);
    const roofResult = parseRoofReportData(roofAnalysisRaw);

    if (!roofResult.success) {
      return {
        success: false,
        data: roofResult.data,
        error: roofResult.error,
        rawText: roofResult.rawText,
      };
    }

    const filePdfName = `task_${taskId}_roofReport.pdf`;
const existingFile = task.files?.find((f) => f.name === filePdfName);
if (existingFile) {
  await deleteFiles([existingFile.id]);
  task.files = (task.files || []).filter((f) => f.name !== filePdfName);
}

const updatedFile = new File(
  [await roofReport.arrayBuffer()],
  filePdfName,
  { type: 'application/pdf' }
);

const uploadedFiles = await uploadFile(updatedFile);
const roofReportFiles = uploadedFiles
  .filter((res) => ('data' in res ? true : false))
  .map((file) => ({
    id: file.data!.key,
    name: file.data!.name,
    url: file.data!.ufsUrl,
  }));

// Prepend newest roof file and keep other files (e.g., insurance) intact
task.files = [...roofReportFiles, ...(task.files || [])];

    await upsertTaskData(session.user.id, taskId, {
  roofData: roofResult.data,
  files: task.files,
  comparison: null,
});
    revalidateTaskData(taskId);

    return {
      success: roofResult.success,
      data: roofResult.data,
      error: roofResult.error,
      rawText: roofResult.rawText,
    };
  } catch (error) {
    console.error('Error extracting roof report data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}