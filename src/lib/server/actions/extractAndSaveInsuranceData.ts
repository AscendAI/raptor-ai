'use server';

import { analyseInsuranceReport } from '../ai/openai';
import { parseInsuranceReportData } from '../../types/extraction';
import { uploadFile, deleteFiles } from '../uploadthing';
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
      console.log('Authentication failed - no user ID');
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const task = await getCachedTaskData(session.user.id, taskId);
    if (!task) {
      console.log('Task not found for taskId:', taskId);
      return {
        success: false,
        error: 'Task not found',
      };
    }

    const structureCount = task.structureCount || 1;
    console.log('Structure count for insurance extraction:', structureCount);
    console.log('Calling AI analysis with', insuranceReportImages.length, 'images');
    
    const insuranceAnalysisRaw = await analyseInsuranceReport(
      insuranceReportImages,
      structureCount
    );
    
    console.log('Raw AI response length:', insuranceAnalysisRaw?.length || 0);
    console.log('Raw AI response preview:', insuranceAnalysisRaw?.substring(0, 200));
    
    const insuranceResult = parseInsuranceReportData(insuranceAnalysisRaw);
    console.log('Parse result success:', insuranceResult.success);
    if (!insuranceResult.success) {
      console.log('Parse error:', insuranceResult.error);
      console.log('Parse raw text:', insuranceResult.rawText?.substring(0, 500));
    }

    if (!insuranceResult.success) {
      return {
        success: false,
        data: insuranceResult.data,
        error: insuranceResult.error,
        rawText: insuranceResult.rawText,
      };
    }

    const filePdfName = `task_${taskId}_insuranceReport.pdf`;
const existingFile = task.files?.find((f) => f.name === filePdfName);
if (existingFile) {
  await deleteFiles([existingFile.id]);
  task.files = (task.files || []).filter((f) => f.name !== filePdfName);
}

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

// Prepend newest insurance file and keep other files (e.g., roof) intact
task.files = [...insuranceReportFiles, ...(task.files || [])];

    await upsertTaskData(session.user.id, taskId, {
      files: task.files,
      insuranceData: insuranceResult.data,
      comparison: null,
    });

    console.log('Successfully saved insurance data to database');
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