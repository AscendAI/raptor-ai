import OpenAI from 'openai';
import { ComparisonResult } from '../../types/comparison';

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

// Multi-structure roof report extraction prompt
function createMultiStructureRoofPrompt(structureCount: number): string {
  return `You are an expert data extraction assistant.
Extract all structured information from the provided roofing report image into clean JSON format for ${structureCount} roof structure(s). 
The document contains sections labeled "Structure 1", "Structure 2", etc. Extract data for each structure separately.
Preserve numerical units exactly as shown (sqft, ft, in, etc.).

This should be the output format:
{
  "structureCount": ${structureCount},
  "structures": [
    {
      "structureNumber": 1,
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
      ]
    }${structureCount > 1 ? ',\n    // ... repeat for Structure 2, 3, 4 as needed' : ''}
  ]
}

Important: Extract data for exactly ${structureCount} structure(s). Each structure should have its own complete set of measurements, pitch_breakdown, and waste_table.`;
}

export async function analyseRoofReport(
  roofReportImages: string[],
  structureCount: number = 1
) {
  const prompt =
    structureCount === 1
      ? roofReportPrompt
      : createMultiStructureRoofPrompt(structureCount);

  const response = await client.responses.create({
    model: 'gpt-5-nano',
    instructions: prompt,
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

// Multi-structure insurance report extraction prompt
function createMultiStructureInsurancePrompt(structureCount: number): string {
  return `You are given an insurance estimate document as images. 
Extract the structured data for ${structureCount} roof structure(s) according to the following rules:

1. Top-level metadata:
   - claim_id → the Claim ID (e.g., "14-82V3-83D")
   - date → the date on the document (e.g., "2025-06-04")
   - price_list → the "Price List" value (e.g., "ININ28_JUL24")
   - structureCount → ${structureCount}

2. Roof sections:
   - Look for sections labeled "Roof1", "Roof2", "Roof3", "Roof4" etc.
   - Extract line items for each roof section separately
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
  "structureCount": ${structureCount},
  "roofSections": [
    {
      "roofNumber": 1,
      "section_name": "Roof1",
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
    }${structureCount > 1 ? ',\n    // ... repeat for Roof2, Roof3, Roof4 as needed' : ''}
  ]
}

4. Important:
   - Extract data for exactly ${structureCount} roof section(s).
   - Do NOT include cost, depreciation, tax, or age/life fields.
   - If a field does not exist → set it to null (do not omit).
   - Ensure all numbers remain as numbers (not strings).
   - Skip all "REVISED" items completely.

Return only valid JSON.`;
}

export async function analyseInsuranceReport(
  insuranceReportImages: string[],
  structureCount: number = 1
) {
  const prompt =
    structureCount === 1
      ? insuranceReportPrompt
      : createMultiStructureInsurancePrompt(structureCount);

  const response = await client.responses.create({
    model: 'gpt-5-mini',
    instructions: prompt,
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

// Multi-structure comparison prompt
function createMultiStructureComparisonPrompt(structureCount: number): string {
  return `You are an expert roofing analyst. Compare the roofing report data with the insurance report data for ${structureCount} roof structure(s).

For each structure, perform a detailed comparison between the roofing report measurements and the insurance report line items. The roofing report is the source of truth.

Key Comparison Points for Each Structure:
1. **Total Roof Area** → Compare to insurance squares (1 square = 100 sqft)
2. **Drip Edge** → Look for drip edge line items in insurance
3. **Ridge Cap** → Compare ridge measurements to ridge cap quantities
4. **Hip Cap** → Compare hip measurements to hip cap quantities  
5. **Starter Shingles** → Compare eaves/rakes to starter quantities
6. **Underlayment** → Compare roof area to underlayment squares
7. **Ice & Water Shield** → Look for ice/water shield line items
8. **Flashing** → Compare flashing measurements to flashing quantities
9. **Waste Factor** → Compare recommended waste % to insurance allowance
10. **Additional Items** → Flag any missing standard roofing components

Rules for Each Structure:
1. Always use the roofing report as the source of truth
2. Flag under-allowances or missing items in the insurance report
3. Mark as "pass" if values match within reasonable tolerance
4. Mark as "failed" if insurance significantly under-allows
5. Mark as "missing" if required items are absent from insurance

Return JSON with this exact schema:
{
  "success": true,
  "structureCount": ${structureCount},
  "summary": {
    "pass": 0,
    "failed": 0, 
    "missing": 0,
    "total": 0
  },
  "structures": [
    {
      "structureNumber": 1,
      "summary": {
        "pass": 0,
        "failed": 0,
        "missing": 0,
        "total": 0
      },
      "comparisons": [
        {
          "checkpoint": "string",
          "status": "pass" | "failed" | "missing",
          "roof_report_value": "string|null",
          "insurance_report_value": "string|null", 
          "notes": "string"
        }
      ]
    }${structureCount > 1 ? ',\n    // ... repeat for each structure' : ''}
  ]
}`;
}

const reportComparisonPrompt = `
You are given two reports:

Roofing report (this is always accurate).

Insurance estimate (may contain mistakes).

Your task: Compare the insurance estimate against the roofing report to identify inaccuracies.

Common Areas of Error:

1. Total Squares & Waste Factor
2. Drip Edge
3. Starter Strip
4. Ridge Cap
5. Ice & Water Shield (Valleys)
6. Step Flashing
7. Chimney Flashing
8. Ventilation Items
9. Steep/High Charges
10. Underlayment Type

Comparison Criteria

Tear-off Quantity: Insurance tear-off ≥ roofing report → pass, else failed.

Square Comparison: Insurance "felt" quantity compared to roofing + waste factor. Insurance ≥ roofing → pass, else failed.

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
  "structureCount": 1,
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
  insuranceReportAnalysis: string,
  structureCount?: number
): Promise<ComparisonResult>;

export async function analyseComparison(
  roofReportData: import('../../types/extraction').RoofReportData,
  insuranceReportData: import('../../types/extraction').InsuranceReportData,
  structureCount?: number
): Promise<ComparisonResult>;

// Implementation
export async function analyseComparison(
  roofReportInput: string | import('../../types/extraction').RoofReportData,
  insuranceReportInput:
    | string
    | import('../../types/extraction').InsuranceReportData,
  structureCount: number = 1
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

  const prompt =
    structureCount === 1
      ? reportComparisonPrompt
      : createMultiStructureComparisonPrompt(structureCount);

  const response = await client.responses.create({
    model: 'gpt-5',
    instructions: prompt,
    // reasoning: { effort: 'high' },
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

  const content = response.output_text;
  if (!content) {
    throw new Error('No response content received from OpenAI');
  }

  const parsed = JSON.parse(content);
  return ComparisonResult.parse(parsed);
}
