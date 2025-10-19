'use server';

import { analyseInsuranceReport } from '../ai/openai';
import { parseInsuranceReportData } from '../../types/extraction';
import { uploadFile } from '../uploadthing';
import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData, revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';

// Extract insurance report data only
export async function extractAndSaveInsuranceData(
  insuranceReportImages: string[],
  taskId: string,
  insuranceReport: File
) {
  try {
    console.log('Extracting insurance report data...');
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

    const insuranceAnalysisRaw = await analyseInsuranceReport(
      insuranceReportImages
    );
    const insuranceResult = parseInsuranceReportData(insuranceAnalysisRaw);

    if (!insuranceResult.success) {
      return {
        success: false,
        data: insuranceResult.data,
        error: insuranceResult.error,
        rawText: insuranceResult.rawText,
      };
    }

    const filePdfName = `task_${taskId}_insuranceReport.pdf`;
    const fileExists = task.files?.some((f) => f.name === filePdfName);

    if (!fileExists) {
      const updatedFile = new File(
        [await insuranceReport.arrayBuffer()],
        filePdfName,
        { type: 'application/pdf' }
      );

      const uploadedFiles = await uploadFile(updatedFile);
      const insuranceReportFiles = uploadedFiles
        .filter((res) => ('data' in res ? true : false))
        .map((file) => ({
          id: file.data!.key,
          name: file.data!.name,
          url: file.data!.ufsUrl,
        }));
      task.files = [...insuranceReportFiles, ...(task.files || [])];
    }

    await upsertTaskData(session.user.id, taskId, {
      files: task.files,
      insuranceData: insuranceResult.data,
    });
    revalidateTaskData(taskId);

    return {
      success: insuranceResult.success,
      data: insuranceResult.data,
      error: insuranceResult.error,
      rawText: insuranceResult.rawText,
    };
  } catch (error) {
    console.error('Error extracting insurance report data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}