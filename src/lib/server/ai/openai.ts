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

2. Roof sections to extract (naming rules):
   - Detect roof sections labeled numerically like "Roof1", "Roof2", "Roof3", etc.
   - ALSO detect semantically named roof sections such as:
       "Home / Main House", "Garage", "Shed / Barn / Outbuilding", "Porch / Patio / Carport", etc.
   - Use the section header text from the document EXACTLY as the section_name (preserve punctuation and slashes). 
     If the header includes a suffix like "- Roof" or "Roof:" (e.g., "Home / Main House - Roof"), remove the suffix and keep just the base name.
   - Extract line items for each roof section separately.
   - Order roofSections as they appear in the document. Assign roofNumber sequentially starting from 1.
   - If the document contains more than ${structureCount} roof sections, include the first ${structureCount} roof-relevant sections in reading order.
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
      "section_name": "Home / Main House",
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
    }${structureCount > 1 ? ',\n    // ... repeat for additional sections such as "Garage", "Shed / Barn / Outbuilding", etc.' : ''}
  ]
}

4. Important:
   - Extract data for ${structureCount} roof section(s) as defined above.
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
  return `You are an expert roofing analyst. Compare the roofing report data with the insurance estimate for ${structureCount} roof structure(s). The roofing report is the source of truth.

Use the following checklist for EACH structure (evaluate independently per structure):
0. Metadata: Price list date — Compare insurance document date vs the month/year encoded in insurance price_list (e.g., ININ28_JUL24 → July 2024); allow minor drift (same month or ±1 month). Pass if same/close; otherwise failed.
1. Total Squares — Roof total area (sqft) vs Insurance squares (SQ) and/or surface area. Pass if Roof >= Insurance. Include tear-off check (Insurance tear-off SQ <= Roof SQ).
2. Waste Factor — Compare Roof recommended waste % (from waste table) vs Insurance laminated comp shingle waste/allowance. Pass if Roof >= Insurance.
3. Drip Edge — Roof eaves + rakes (LF) vs Insurance drip edge (LF). Pass if Roof >= Insurance.
4. Starter Strip — Roof eaves + rakes (LF) vs Insurance starter strip (LF). Pass if Roof >= Insurance. WARNING if text indicates starter cut from field shingles.
5. Ridge Cap — Roof hips + ridges (LF) vs Insurance hip/ridge cap (LF). Pass if Roof >= Insurance. WARNING if hip/ridge states cut from 3-tab.
6. Ice & Water Shield (Valleys) — Roof total valley length * 6 ft width (SF) vs Insurance ice/water shield (SF). Pass if Roof >= Insurance.
7. Step Flashing — Roof total wall flashing + total step flashing (LF) vs Insurance step flashing (LF). Missing if not listed.
8. Chimney Flashing — Check presence in Insurance. Present → pass. Missing → missing with WARNING.
9. Ventilation Items — Check presence in Insurance (e.g., ridge vent, box vents, turtle, power vents). Present → pass. Missing → missing with WARNING.
10. Steep Roof 7/12–9/12 (Remove) — Sum (7/12 + 9/12) SQ vs Insurance removal add-on. If a pitch bucket is missing in the Roof report, treat its value as 0 (partial presence allowed). Pass if Roof >= Insurance.
11. Steep Roof 7/12–9/12 (Put back) — (7/12 + 9/12) SQ plus recommended waste % of that sum. If a pitch bucket is missing, treat it as 0. Pass if Roof >= Insurance.
12. Steep Roof 10/12–12/12 (Remove) — Sum (10/12 + 12/12) SQ vs Insurance removal add-on. If a pitch bucket is missing, treat it as 0. Pass if Roof >= Insurance.
13. Steep Roof 10/12–12/12 (Put back) — (10/12 + 12/12) SQ plus recommended waste % of that sum. If a pitch bucket is missing, treat it as 0. Pass if Roof >= Insurance.
14. Underlayment — Check presence/type in Insurance. Present → pass. Missing → missing with WARNING.

Rules:
- Always use the roofing report as the source of truth.
- Flag under-allowances or missing items in the insurance report.
- Use status: "pass", "failed", or "missing".
- Provide clear notes showing the calculation/logic and any assumptions.
- If a checkpoint has a notable caveat (e.g., ridge cut from 3-tab, starter cut from field), include a human-readable WARNING message; otherwise set warning to null.

Edge cases for pitch-based checkpoints (10–13):
- If the sum for a pitch group equals 0 SQ (e.g., only 5/12 present, no 7/12–9/12 or 10/12–12/12), then:
  * If the Insurance report has corresponding steep add-ons (> 0), mark "failed" (over-allowance) and note expected 0 SQ.
  * If the Insurance report has no such add-ons, mark "pass".
  * Always show the computed roof_report_value (e.g., "0 SQ").

Return JSON with this exact schema:
{
  "success": true,
  "structureCount": ${structureCount},
  "summary": { "pass": 0, "failed": 0, "missing": 0, "total": 0 },
  "structures": [
    {
      "structureNumber": 1,
      "summary": { "pass": 0, "failed": 0, "missing": 0, "total": 0 },
      "comparisons": [
        {
          "checkpoint": "string",
          "status": "pass" | "failed" | "missing",
          "roof_report_value": "string|null",
          "insurance_report_value": "string|null",
          "notes": "string",
          "warning": "string|null"
        }
      ]
    }${structureCount > 1 ? ',\n    // ... repeat for each structure' : ''}
  ]
}`;
}

const reportComparisonPrompt = `
You are given two reports:

- Roofing report (always accurate)
- Insurance estimate (may contain mistakes)

Your task: Compare the insurance estimate against the roofing report using the checklist below and return structured JSON.

Checklist (single-structure):
0. Metadata: Price list date — Compare insurance document date vs the month/year encoded in insurance price_list (e.g., ININ28_JUL24 → July 2024); allow minor drift (same month or ±1 month).
1. Total Squares — Roof total area (sqft) vs Insurance squares (SQ)/surface area; include tear-off check.
2. Waste Factor — Roof recommended waste % vs Insurance laminated comp shingle waste/allowance.
3. Drip Edge — Roof eaves + rakes (LF) vs Insurance drip edge (LF).
4. Starter Strip — Roof eaves + rakes (LF) vs Insurance starter (LF). WARNING if starter cut from field shingles.
5. Ridge Cap — Roof hips + ridges (LF) vs Insurance hip/ridge cap (LF). WARNING if hip/ridge cut from 3-tab.
6. Ice & Water Shield (Valleys) — Roof total valley length * 6 ft width (SF) vs Insurance IWS (SF).
7. Step Flashing — Roof total wall flashing + total step flashing (LF) vs Insurance step flashing (LF).
8. Chimney Flashing — Presence in Insurance. If missing → missing and WARNING.
9. Ventilation Items — Presence in Insurance. If missing → missing and WARNING.
10. Steep 7/12–9/12 (Remove) — (7/12 + 9/12) SQ vs Insurance removal add-on. If a pitch bucket is missing in the Roof report, treat it as 0.
11. Steep 7/12–9/12 (Put back) — (7/12 + 9/12) SQ + recommended waste % vs Insurance add-on. Treat missing pitch buckets as 0.
12. Steep 10/12–12/12 (Remove) — (10/12 + 12/12) SQ vs Insurance removal add-on. Treat missing pitch buckets as 0.
13. Steep 10/12–12/12 (Put back) — (10/12 + 12/12) SQ + recommended waste % vs Insurance add-on. Treat missing pitch buckets as 0.
14. Underlayment — Presence/type in Insurance; missing → WARNING.

Rules:
- Always use the roofing report as the source of truth.
- Flag under-allowances or missing items in the insurance report.
- Use status: "pass", "failed", or "missing".
- Provide clear notes explaining each decision and showing relevant quantities.
- Use the WARNING field to flag caveats like: hip/ridge "cut from 3-tab", starter cut from field shingles, missing chimney flashing, missing ventilation, missing underlayment.

Edge cases for pitch-based checkpoints (10–13):
- If the sum for a pitch group equals 0 SQ (e.g., only 5/12 present, no 7/12–9/12 or 10/12–12/12), then:
  * If the Insurance report has corresponding steep add-ons (> 0), mark "failed" (over-allowance) and note expected 0 SQ.
  * If the Insurance report has no such add-ons, mark "pass".
  * Always show the computed roof_report_value (e.g., "0 SQ").

JSON Output Schema
{
  "success": true,
  "structureCount": 1,
  "summary": { "pass": 0, "failed": 0, "missing": 0, "total": 0 },
  "comparisons": [
    {
      "checkpoint": "string",            // e.g., "Drip Edge"
      "status": "pass" | "failed" | "missing",
      "roof_report_value": "string|null",
      "insurance_report_value": "string|null",
      "notes": "string",                 // explanation for decision
      "warning": "string|null"           // warning message if applicable
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
