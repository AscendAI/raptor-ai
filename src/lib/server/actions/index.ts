"use server";

import { analyseComparison, analyseInsuranceReport, analyseRoofReport } from "../ai/openai";

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
  const fullAnalysis = await analyseComparison(roofReportAnalysis, insuranceAnalysis)
  return fullAnalysis
}
