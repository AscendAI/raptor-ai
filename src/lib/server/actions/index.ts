'use server';

import {
  analyseRoofReport,
  analyseInsuranceReport,
  analyseComparison,
} from '../ai/openai';
import {
  parseRoofReportData,
  parseInsuranceReportData,
  stringifyForComparison,
  type RoofReportData,
  type InsuranceReportData,
} from '../../schemas/extraction';
import { type ComparisonResult } from '../../schemas/comparison';

// Extract roof report data only
export async function extractRoofData(roofReportImages: string[]) {
  try {
    console.log('Extracting roof report data...');
    const roofAnalysisRaw = await analyseRoofReport(roofReportImages);
    const roofResult = parseRoofReportData(roofAnalysisRaw);

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

// Extract insurance report data only
export async function extractInsuranceData(insuranceReportImages: string[]) {
  try {
    console.log('Extracting insurance report data...');
    const insuranceAnalysisRaw = await analyseInsuranceReport(
      insuranceReportImages
    );
    const insuranceResult = parseInsuranceReportData(insuranceAnalysisRaw);

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

// Extract data from both reports (Phase 1)
// Generate final analysis using user-reviewed data (Phase 2)
export async function generateFinalAnalysis(
  roofData: RoofReportData,
  insuranceData: InsuranceReportData
) {
  try {
    console.log('Generating final analysis with user-reviewed data...');

    // Convert parsed data back to string format for AI comparison
    const { roofReportText, insuranceReportText } = stringifyForComparison(
      roofData,
      insuranceData
    );

    // Generate comparison analysis
    console.log('Comparing reports...');
    const comparison = await analyseComparison(
      roofReportText,
      insuranceReportText
    );
    console.log('Comparison completed:', comparison);

    return {
      success: true,
      roofData,
      insuranceData,
      comparison,
    };
  } catch (error) {
    console.error('Error generating final analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// User data management actions
interface UserReviewTask {
  id: string;
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalysisResult {
  taskId: string;
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  comparison: ComparisonResult;
  completedAt: Date;
}

// In-memory storage for demo purposes (replace with database in production)
const userTasks = new Map<string, UserReviewTask>();
const analysisResults = new Map<string, AnalysisResult>();

// Save user-modified extracted data
export async function saveUserReviewData(
  taskId: string,
  roofData: RoofReportData,
  insuranceData: InsuranceReportData
) {
  try {
    const task: UserReviewTask = {
      id: taskId,
      roofData,
      insuranceData,
      createdAt: userTasks.get(taskId)?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    userTasks.set(taskId, task);

    return {
      success: true,
      taskId,
      message: 'User review data saved successfully',
    };
  } catch (error) {
    console.error('Error saving user review data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Retrieve user-modified extracted data
export async function getUserReviewData(taskId: string) {
  try {
    const task = userTasks.get(taskId);

    if (!task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    return {
      success: true,
      data: {
        roofData: task.roofData,
        insuranceData: task.insuranceData,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    };
  } catch (error) {
    console.error('Error retrieving user review data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Create a new user review task with extracted data
export async function createUserReviewTask(
  roofData: RoofReportData,
  insuranceData: InsuranceReportData
) {
  try {
    const taskId = `${Math.random().toString(36).substr(2, 6)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const task: UserReviewTask = {
      id: taskId,
      roofData,
      insuranceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userTasks.set(taskId, task);

    return {
      success: true,
      taskId,
      data: {
        roofData,
        insuranceData,
      },
    };
  } catch (error) {
    console.error('Error creating user review session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Create a user review task with just roof data initially
export async function createRoofReviewTask(roofData: RoofReportData) {
  try {
    const taskId = `${Math.random().toString(36).substr(2, 6)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a partial task with just roof data
    const task: Partial<UserReviewTask> & {
      id: string;
      roofData: RoofReportData;
      createdAt: Date;
      updatedAt: Date;
    } = {
      id: taskId,
      roofData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userTasks.set(taskId, task as UserReviewTask);

    return {
      success: true,
      taskId,
      data: {
        roofData,
      },
    };
  } catch (error) {
    console.error('Error creating roof review task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Create a roof review task with a predefined task ID
export async function createRoofReviewTaskWithId(
  taskId: string,
  roofData: RoofReportData
) {
  try {
    // Create a partial task with just roof data
    const task: Partial<UserReviewTask> & {
      id: string;
      roofData: RoofReportData;
      createdAt: Date;
      updatedAt: Date;
    } = {
      id: taskId,
      roofData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userTasks.set(taskId, task as UserReviewTask);

    return {
      success: true,
      taskId,
      data: {
        roofData,
      },
    };
  } catch (error) {
    console.error('Error creating roof review task with ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Update an existing task with insurance data
export async function updateTaskWithInsuranceData(
  taskId: string,
  insuranceData: InsuranceReportData
) {
  try {
    const existingTask = userTasks.get(taskId);
    if (!existingTask) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    const updatedTask: UserReviewTask = {
      ...existingTask,
      insuranceData,
      updatedAt: new Date(),
    };

    userTasks.set(taskId, updatedTask);

    return {
      success: true,
      taskId,
      data: {
        roofData: updatedTask.roofData,
        insuranceData,
      },
    };
  } catch (error) {
    console.error('Error updating task with insurance data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Delete a user review session
export async function deleteUserReviewTask(taskId: string) {
  try {
    const deleted = userTasks.delete(taskId);

    return {
      success: deleted,
      message: deleted ? 'Session deleted successfully' : 'Session not found',
    };
  } catch (error) {
    console.error('Error deleting user review session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Retrieve analysis results
export async function getAnalysisResults(taskId: string) {
  try {
    const result = analysisResults.get(taskId);

    if (!result) {
      return {
        success: false,
        error: 'Analysis results not found for this task',
      };
    }

    return {
      success: true,
      data: {
        roofData: result.roofData,
        insuranceData: result.insuranceData,
        comparison: result.comparison,
        completedAt: result.completedAt,
      },
    };
  } catch (error) {
    console.error('Error retrieving analysis results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Clean up old analysis results (call periodically)
export async function cleanupOldResults() {
  try {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, result] of Array.from(analysisResults.entries())) {
      if (now.getTime() - result.completedAt.getTime() > maxAge) {
        analysisResults.delete(sessionId);
      }
    }

    return {
      success: true,
      message: 'Old results cleaned up successfully',
    };
  } catch (error) {
    console.error('Error cleaning up old results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Complete the workflow after user review
export async function completeAnalysisWorkflow(taskId: string) {
  try {
    console.log('Completing analysis workflow after user review...');

    // Retrieve user-reviewed data
    const sessionData = await getUserReviewData(taskId);

    if (!sessionData.success) {
      return {
        success: false,
        error: sessionData.error,
        phase: 'data_retrieval',
      };
    }

    // Generate final analysis with user-reviewed data
    const finalResult = await generateFinalAnalysis(
      sessionData.data!.roofData,
      sessionData.data!.insuranceData
    );

    if (!finalResult.success) {
      return {
        success: false,
        error: finalResult.error,
        phase: 'final_analysis',
      };
    }

    // Store the analysis result temporarily for display
    const analysisResult: AnalysisResult = {
      taskId,
      roofData: finalResult.roofData!,
      insuranceData: finalResult.insuranceData!,
      comparison: finalResult.comparison!,
      completedAt: new Date(),
    };

    analysisResults.set(taskId, analysisResult);

    // Clean up session after successful completion
    await deleteUserReviewTask(taskId);

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

// Legacy function for backward compatibility (will be deprecated)
export async function analyseFiles(input: {
  roofReport: string[];
  insuranceReport: string[];
}) {
  const { roofReport, insuranceReport } = input;
  // const files = await uploadFiles([
  //   ...roofReport.map((report, idx) => ({
  //     name: `roofReport_${id}_${idx}`,
  //     type: "png",
  //     data: report,
  //   })),
  //   ...insuranceReport.map((report, idx) => ({
  //     name: `insuranceReport_${id}_${idx}`,
  //     type: "png",
  //     data: report,
  //   })),
  // ]);

  // const roofReportUrls = files
  //   .filter((file) => file.data?.name?.startsWith("roofReport"))
  //   .map((file) => file.data?.ufsUrl);
  // const insuranceReportUrls = files
  //   .filter((file) => file.data?.name?.startsWith("insuranceReport"))
  //   .map((file) => file.data?.ufsUrl);

  const roofReportAnalysis = await analyseRoofReport(roofReport);
  const insuranceAnalysis = await analyseInsuranceReport(insuranceReport);
  console.log(roofReportAnalysis);
  console.log(insuranceAnalysis);
  const fullAnalysis = await analyseComparison(
    roofReportAnalysis,
    insuranceAnalysis
  );
  return fullAnalysis;
}
