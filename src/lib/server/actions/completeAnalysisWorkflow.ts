'use server';

import { getAuthSession } from '@/lib/server/auth';
import { revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';
import { getUserReviewData } from './getUserReviewData';
import { generateFinalAnalysis } from './generateFinalAnalysis';

// Complete the workflow after user review
export async function completeAnalysisWorkflow(taskId: string) {
  try {
    console.log('Completing analysis workflow after user review...');

    const sessionData = await getUserReviewData(taskId);

    if (!sessionData.success) {
      return {
        success: false,
        error: sessionData.error,
        phase: 'data_retrieval',
      };
    }

    if (!sessionData.data?.roofData || !sessionData.data?.insuranceData) {
      return {
        success: false,
        error: 'Missing roof or insurance data',
        phase: 'data_validation',
      };
    }

    // Get structure count from the task data
    const structureCount = sessionData.data.roofData.structureCount || 1;

    const finalResult = await generateFinalAnalysis(
      sessionData.data.roofData,
      sessionData.data.insuranceData,
      structureCount
    );

    if (!finalResult.success) {
      return {
        success: false,
        error: finalResult.error,
        phase: 'final_analysis',
      };
    }

    const session = await getAuthSession();
    if (session?.user?.id) {
      await upsertTaskData(session.user.id, taskId, {
        roofData: finalResult.roofData!,
        insuranceData: finalResult.insuranceData!,
        comparison: finalResult.comparison!,
      });
      revalidateTaskData(taskId);
    }

    return {
      success: true,
      phase: 'completed',
      result: {
        roofData: finalResult.roofData,
        insuranceData: finalResult.insuranceData,
        comparison: finalResult.comparison,
      },
      message: 'Analysis completed successfully with user-reviewed data.',
    };
  } catch (error) {
    console.error('Error completing analysis workflow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      phase: 'completion',
    };
  }
}