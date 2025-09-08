import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const roofReportPrompt = `You are an expert data extraction assistant.
Extract all structured information from the provided roofing report image into clean JSON format. Preserve numerical units exactly as shown (sqft, ft, in, etc.).
This should be the output format:
{
  "measurements": {
    "total_roof_area": "Value Unit" or null,
    "total_pitched_area": "Value Unit" or null,
    "total_flat_area": "Value Unit" or null,
    "total_roof_facets": "Value Unit" or null,
    "predominant_pitch": "Value Unit" or null,
    "total_eaves": "Value Unit" or null,
    "total_valleys": "Value Unit" or null,
    "total_hips": "Value Unit" or null,
    "total_ridges": "Value Unit" or null,
    "total_rakes": "Value Unit" or null,
    "total_wall_flashing": "Value Unit" or null,
    "total_step_flashing": "Value Unit" or null,
    "total_transitions": "Value Unit" or null,
    "total_parapet_wall": "Value Unit" or null,
    "total_unspecified": "Value Unit" or null,
    "hips_ridges": "Value Unit" or null,
    "eaves_rakes": "Value Unit" or null,
    ...enter other measurements here if any
  },
  "pitch_breakdown": [
    {"pitch": "fraction", "area_sqft": "number", "squares": "number"},
    {"pitch": "fraction", "area_sqft": "number", "squares": "number"},
    ...etc
  ],
  "waste_table": [
    {"waste_percent": "value", "area_sqft": "value", "squares": "value", "recommended": false},
    {"waste_percent": "value", "area_sqft": "value", "squares": "value", "recommended": true},
    {"waste_percent": "value", "area_sqft": "value", "squares": "value", "recommended": false},
    ...etc
  ],
}
`;

export async function analyseRoofReport(roofReportImages: string[]) {
  const response = await client.responses.create({
    model: 'gpt-5-nano',
    instructions: roofReportPrompt,
    input: [
      {
        role: 'user',
        content: roofReportImages.map((image) => ({
          type: 'input_image',
          image_url: image,
          detail: 'high',
        })),
      },
    ],
  });
  console.log(JSON.stringify(response.usage, null, 2));
  return response.output_text;
}

const insuranceReportPrompt = `
You are given an insurance estimate document as images. 
Extract the structured data according to the following rules:

1. Top-level metadata:
   - claim_id → the Claim ID (e.g., "14-82V3-83D")
   - date → the date on the document (e.g., "2025-06-04")
   - price_list → the "Price List" value (e.g., "ININ28_JUL24")

2. Line items:
   - Focus on all line items under the **Roof** section. 
   - Stop extracting when the section changes (e.g., "Front Elevation", "Right Elevation", "Exterior").
   - Skip any line item explicitly marked as **REVISED**.
   - For each valid line item, capture:
       * item_no → the line item number (integer)
       * description → full text of the description
       * quantity → split into:
           - value (decimal or null if missing)
           - unit (string or null if missing)
       * options_text → if an "Options:" / "Auto Calculated Waste:" / "Bundle Rounding:" or similar block is tied to the item, capture it verbatim (string). If none exists, return null.

3. Output format:
   - JSON with this shape:

{
  "claim_id": "string",
  "date": "string",
  "price_list": "string",
  "sections": [
    {
      "section_name": "Roof",
      "line_items": [
        {
          "item_no": number,
          "description": "string",
          "quantity": {
            "value": number | null,
            "unit": "string" | null
          },
          "options_text": "string" | null
        }
      ]
    }
  ]
}

4. Important:
   - Do NOT include cost, depreciation, tax, or age/life fields.
   - If a field does not exist → set it to null (do not omit).
   - Ensure all numbers remain as numbers (not strings).
   - Skip all "REVISED" items completely.

Return only valid JSON.
`;

export async function analyseInsuranceReport(insuranceReportImages: string[]) {
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    instructions: insuranceReportPrompt,
    input: [
      {
        role: 'user',
        content: insuranceReportImages.map((image) => ({
          type: 'input_image',
          image_url: image,
          detail: 'high',
        })),
      },
    ],
  });
  return response.output_text;
}

const reportComparisonPrompt = `
I have two reports:
A roofing report from a company fixing the roof of a client's property.
An insurance estimate from the client's insurance company.

Assume the roofing report is always accurate, but the insurance report may contain mistakes.
Your task is to compare the two reports to identify inaccuracies in the insurance estimate. These are common areas that a roofing report might miss or the insurance report might get wrong:

Total Squares and Waste Factor: Compare the insurance estimate's total squares to the roofing report. Ensure that the appropriate waste factor (10-15%) is applied.

Drip Edge: Verify that the drip edge is included as required by code for all eaves+rakes. It must be new and cannot be reused.

Starter Strip: Confirm that the starter strip is required at eaves+rakes, and ensure it is not cut from field shingles. This is also a manufacturer warranty requirement.

Ridge Cap: Check if the ridge cap in the insurance estimate matches the manufacturer's specifications, particularly if architectural shingles are used. Ensure the ridge footage aligns with the roofing report.

Ice & Water Shield in Valleys: Verify that ice and water shield is included in the valleys, as required by the International Residential Code (IRC). The length should be calculated based on a 6-foot width.

Step Flashing: Confirm that step flashing is included at roof-to-wall intersections. Per manufacturer guidance, step flashing cannot be reused.

Chimney Flashing: Check if chimney flashing is included when a chimney is present. The flashing should include base flashing, counter flashing, and a cricket if the chimney width exceeds 30 inches.

Ventilation Items: Ensure the insurance report includes all necessary ventilation items such as turtle vents, ridge vents, exhaust caps, and flue caps. These must match the existing ventilation system.

Steep/High Charges: Confirm that additional charges for steep roofs (7/12-9/12 and 10/12+ pitches) are applied, and verify if a high charge is added for roofs requiring access to two or more stories.

Underlayment Type: Confirm whether synthetic underlayment is required, according to manufacturer and code specifications. Many adjusters default to felt underlayment.

Comparison Criteria:
Tear-off Quantity: Compare the tear-off quantity in both reports. If the insurance estimate's tear-off quantity is equal to or greater than the roofing report, flag it as a green flag.

Square Comparison: Compare the “felt” quantity from the insurance estimate with the recommended waste percentage in the roofing report. If the insurance estimate's value is equal to or greater than the roofing report's recommendation, flag it as a green flag; otherwise, it's a red flag.

Drip Edge: Compare the drip edge quantity in the insurance report with the total eaves + rakes in the roofing report. If the insurance value is equal to or greater than the roofing report, it's a green flag.

Starter Strip: Compare the starter strip value in the insurance report with the roofing report's eaves + rakes. Also, check the option text (if available) to ensure the starter strip is not cut from field shingles, as required by the manufacturer's warranty.

Hip/Ridge Cap: Compare the hip/ridge cap value in the insurance report with the hips and ridges in the roofing report. If the insurance report's value is equal to or greater than the roofing report, flag it as a green flag; otherwise, it's a red flag.

Ice & Water Shield in Valleys: Ensure that the insurance estimate includes the proper ice and water shield in valleys (valley length * 6 feet width).

Step Flashing: Check if step flashing is included in the insurance report. If missing, flag it as missing and note that it should be included.

Chimney Flashing: Verify if chimney flashing is included in the insurance report. If missing, flag it as missing and state that it should be included.

Ventilation Items: Check if ventilation items (turtle vents, ridge vents, exhaust caps, flue caps) are included in the insurance report. If missing, flag them as missing and state that they should be included.

Remove Additional Charge for Steep Roof (7/12-9/12 slope): Compare the value in the insurance report with the total squares of 7/12 + 9/12 slope from the roofing report.

Additional Charge for Steep Roof (7/12-9/12 slope): Compare the insurance estimate value with the roofing report's total squares (7/12 + 9/12). Add the recommended waste percentage to the total. If the insurance estimate does not meet the expected value, flag it as a red flag.

Remove Additional Charge for Steep Roof (10/12'12/12 slope): Compare the value in the insurance report with the total squares of 10/12-12/12 slope from the roofing report.

Additional Charge for Steep Roof (10/12-12/12 slope): Compare the value in the insurance report with the roofing report's total squares (10/12-12/12). Add the recommended waste percentage to the total. If 10/12 is missing, use only 12/12, and vice versa.
Underlayment Type: Confirm whether synthetic underlayment is required, according to manufacturer and code specifications. Many adjusters default to felt underlayment.

Your response should be nicely organized and easy to understand.`;

// Overloaded function signatures for backward compatibility
export async function analyseComparison(
  roofReportAnalysis: string,
  insuranceReportAnalysis: string
): Promise<string>;

export async function analyseComparison(
  roofReportData: import('../../schemas/extraction').RoofReportData,
  insuranceReportData: import('../../schemas/extraction').InsuranceReportData
): Promise<string>;

// Implementation
export async function analyseComparison(
  roofReportInput: string | import('../../schemas/extraction').RoofReportData,
  insuranceReportInput: string | import('../../schemas/extraction').InsuranceReportData
) {
  // Convert inputs to string format for AI processing
  let roofReportText: string;
  let insuranceReportText: string;
  
  if (typeof roofReportInput === 'string') {
    roofReportText = roofReportInput;
  } else {
    // Convert parsed data to formatted string
    roofReportText = JSON.stringify(roofReportInput, null, 2);
  }
  
  if (typeof insuranceReportInput === 'string') {
    insuranceReportText = insuranceReportInput;
  } else {
    // Convert parsed data to formatted string
    insuranceReportText = JSON.stringify(insuranceReportInput, null, 2);
  }
  
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    instructions: reportComparisonPrompt,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Roof Report Analysis: ${roofReportText}\n\nInsurance Report Analysis: ${insuranceReportText}`,
          },
        ],
      },
    ],
  });
  return response.output_text;
}
