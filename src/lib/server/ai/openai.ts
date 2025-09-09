import OpenAI from 'openai';
import { ComparisonResult } from '../../schemas/comparison';

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
You are given two reports:

Roofing report (this is always accurate).

Insurance estimate (may contain mistakes).

Your task: Compare the insurance estimate against the roofing report to identify inaccuracies.

Common Areas of Error:

Total Squares & Waste Factor: Compare the insurance estimate's total squares to the roofing report. Ensure a proper waste factor of 10–15% is applied.

Drip Edge: Must be included for all eaves and rakes; required by code. It must be new (cannot be reused).

Starter Strip: Required at eaves and rakes. Cannot be cut from field shingles (per manufacturer warranty).

Ridge Cap: Must match manufacturer's specifications for architectural shingles. Ridge footage must align with the roofing report.

Ice & Water Shield (Valleys): Required by IRC in valleys. Should be calculated as (valley length * 6 ft width).

Step Flashing: Required at roof-to-wall intersections. Cannot be reused.

Chimney Flashing: Must be included if a chimney is present. Includes base flashing, counter flashing, and a cricket if chimney width > 30".

Ventilation Items: Insurance report must include turtle vents, ridge vents, exhaust caps, and flue caps matching the existing system.

Steep/High Charges: Verify additional charges for steep slopes (7/12-9/12 and 10/12-12/12). Confirm if extra charges are included for two+ story access.

Underlayment Type: Confirm that synthetic underlayment is included. Defaulting to felt is incorrect.

Comparison Criteria

Tear-off Quantity: Insurance tear-off ≥ roofing report → pass, else failed.

Square Comparison: Insurance “felt” quantity compared to roofing + waste factor. Insurance ≥ roofing → pass, else failed.

Drip Edge: Insurance quantity vs roofing eaves+rakes. Insurance ≥ roofing → pass, else failed.

Starter Strip: Insurance vs roofing eaves+rakes. Must not be cut from field shingles.

Hip/Ridge Cap: Insurance vs roofing hips+ridges. Insurance ≥ roofing → pass, else failed.

Ice & Water Shield in Valleys: Must include correct (valley length * 6 ft width).

Step Flashing: If not listed in insurance → missing, else pass.

Chimney Flashing: If not listed in insurance → missing, else pass.

Ventilation Items: If missing from insurance → missing, else pass.

Steep Roof (7/12-9/12):

Removal Charge → Compare to combined squares.

Additional Charge → Compare to squares + waste factor.

Steep Roof (10/12-12/12):

Removal Charge → Compare to combined squares.

Additional Charge → Compare to squares + waste factor.

Underlayment Type: If missing from insurance → missing, else pass.

Rules

1. Always use the roofing report as the source of truth.

2. Flag under-allowances or missing items in the insurance report.

3. Always return JSON using the schema below.

4. Provide a clear note for each checkpoint explaining why it was marked.

JSON Output Schema
{
  "success": true,
  "summary": {
    "pass": 0,        // number of items marked as pass
    "failed": 0,      // number of items marked as failed
    "missing": 0,     // number of items marked as missing
    "total": 0        // total checkpoints evaluated
  },
  "comparisons": [
    {
      "checkpoint": "string",            // e.g., "Drip Edge"
      "status": "pass" | "failed" | "missing",
      "roof_report_value": "string|null",
      "insurance_report_value": "string|null",
      "notes": "string"                  // explanation for decision
    }
  ]
}`;

// Overloaded function signatures for backward compatibility
export async function analyseComparison(
  roofReportAnalysis: string,
  insuranceReportAnalysis: string
): Promise<ComparisonResult>;

export async function analyseComparison(
  roofReportData: import('../../schemas/extraction').RoofReportData,
  insuranceReportData: import('../../schemas/extraction').InsuranceReportData
): Promise<ComparisonResult>;

// Implementation
export async function analyseComparison(
  roofReportInput: string | import('../../schemas/extraction').RoofReportData,
  insuranceReportInput:
    | string
    | import('../../schemas/extraction').InsuranceReportData
): Promise<ComparisonResult> {
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

  const response = await client.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: reportComparisonPrompt,
      },
      {
        role: 'user',
        content: `Roof Report Analysis: ${roofReportText}\n\nInsurance Report Analysis: ${insuranceReportText}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response content received from OpenAI');
  }

  const parsed = JSON.parse(content);
  return ComparisonResult.parse(parsed);
}
