'use server';

import { analyseComparison } from '../ai/openai';
import { stringifyForComparison, type RoofReportData, type InsuranceReportData } from '../../types/extraction';

// Generate final analysis using user-reviewed data (Phase 2)
export async function generateFinalAnalysis(
  roofData: RoofReportData,
  insuranceData: InsuranceReportData,
  structureCount: number = 1
) {
  try {
    console.log('Generating final analysis with user-reviewed data...');

    const { roofReportText, insuranceReportText } = stringifyForComparison(
      roofData,
      insuranceData
    );

    console.log('Comparing reports...');
    const comparison = await analyseComparison(
      roofReportText,
      insuranceReportText,
      structureCount
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