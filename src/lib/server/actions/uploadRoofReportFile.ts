'use server';

import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData, revalidateTaskData } from '@/lib/server/cache';
import { uploadFile, deleteFiles } from '@/lib/server/uploadthing';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';

// Upload only the roof report PDF and update task.files
export async function uploadRoofReportFile(taskId: string, roofReport: File) {
  try {
    console.log('[uploadRoofReportFile] Starting upload for taskId:', taskId);
    const session = await getAuthSession();
    if (!session?.user?.id) {
      console.log('[uploadRoofReportFile] Not authenticated');
      return { success: false, error: 'Not authenticated' } as const;
    }

    const task = await getCachedTaskData(session.user.id, taskId);
    if (!task) {
      console.log('[uploadRoofReportFile] Task not found:', taskId);
      return { success: false, error: 'Task not found' } as const;
    }

    const filePdfName = `task_${taskId}_roofReport.pdf`;
    const existingFile = task.files?.find((f) => f.name === filePdfName);
    if (existingFile) {
      console.log('[uploadRoofReportFile] Deleting existing roof report file:', existingFile.id);
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

    // Prepend newest roof file and keep other files intact
    task.files = [...roofReportFiles, ...(task.files || [])];

    await upsertTaskData(session.user.id, taskId, {
      files: task.files,
    });
    revalidateTaskData(taskId);

    console.log('[uploadRoofReportFile] Uploaded roof PDF:', {
      taskId,
      uploadedCount: roofReportFiles.length,
      fileNames: roofReportFiles.map((f) => f.name),
    });

    return { success: true, files: task.files } as const;
  } catch (error) {
    console.error('[uploadRoofReportFile] Error uploading roof report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    } as const;
  }
}