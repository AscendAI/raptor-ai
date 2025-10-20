'use server';

import { analyseRoofReport, analyseInsuranceReport, analyseComparison } from '../ai/openai';

// Legacy function for backward compatibility (will be deprecated)
export async function analyseFiles(input: {
  roofReport: string[];
  insuranceReport: string[];
}) {
  const { roofReport, insuranceReport } = input;

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