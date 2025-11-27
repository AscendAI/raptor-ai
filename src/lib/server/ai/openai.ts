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
  structureCount: number = 1,
  specialInstructions?: string
) {
  let prompt =
    structureCount === 1
      ? roofReportPrompt
      : createMultiStructureRoofPrompt(structureCount);

  if (specialInstructions) {
    prompt += `\n\nADDITIONAL USER INSTRUCTIONS:\n${specialInstructions}\n\nPlease incorporate these instructions while maintaining the required output format.`;
  }

  const response = await client.responses.create({
    model: 'gpt-5-mini',
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
Extract the structured data for UP TO ${structureCount} roof structure(s) according to the following rules:

1. Top-level metadata:
   - claim_id → the Claim ID (e.g., "14-82V3-83D")
   - date → the date on the document (e.g., "2025-06-04")
   - price_list → the "Price List" value (e.g., "ININ28_JUL24")
   - structureCount → ${structureCount}

2. Roof sections to extract (naming rules):
   - Detect roof sections labeled numerically like "Roof1", "Roof2", "Roof3", etc.
   - ALSO detect semantically named roof sections. VALID patterns include:
       * "Home", "Main House", "Dwelling"
       * "Garage", "Detached Garage"
       * "Shed", "Barn", "Outbuilding"
       * "Porch", "Patio", "Carport"
   - CRITICAL: Do NOT treat "Elevation" sections (e.g., "Left Elevation", "Right Elevation", "Front Elevation") as roof sections. Only extract sections that are clearly roof structures. If a section header contains "Elevation", SKIP IT.
   - CRITICAL: Do NOT extract sections that are continuations of previous pages (e.g., "Roof 1 continued", "Home continued"). These are NOT new structures.
   - Use the section header text from the document EXACTLY as the section_name (preserve punctuation and slashes). 
     If the header includes a suffix like "- Roof" or "Roof:" (e.g., "Home / Main House - Roof"), remove the suffix and keep just the base name.
   - Extract line items for each roof section separately.
   - Order roofSections as they appear in the document. Assign roofNumber sequentially starting from 1.
   - If the document contains more than ${structureCount} roof sections, include the first ${structureCount} roof-relevant sections in reading order.
   - If fewer than ${structureCount} valid roof structures are found, you MUST still return ${structureCount} entries in 'roofSections'. For missing structures, set 'section_name' to null and 'line_items' to [].
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
      "section_name": "Home / Main House" | null,
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
    }${structureCount > 1 ? ',\n    // ... repeat for additional sections. If missing, return { "roofNumber": N, "section_name": null, "line_items": [] }' : ''}
  ]
}

4. Important:
   - Extract data for UP TO ${structureCount} roof section(s) as defined above.
   - Do NOT include cost, depreciation, tax, or age/life fields.
   - If a field does not exist → set it to null (do not omit).
   - Ensure all numbers remain as numbers (not strings).
   - Skip all "REVISED" items completely.
   - Ensure the output array "roofSections" has EXACTLY ${structureCount} items, even if some are empty placeholders.

Return only valid JSON.`;
}

export async function analyseInsuranceReport(
  insuranceReportImages: string[],
  structureCount: number = 1,
  specialInstructions?: string
) {
  let prompt =
    structureCount === 1
      ? insuranceReportPrompt
      : createMultiStructureInsurancePrompt(structureCount);

  if (specialInstructions) {
    prompt += `\n\nADDITIONAL USER INSTRUCTIONS:\n${specialInstructions}\n\nPlease incorporate these instructions while maintaining the required output format.`;
  }

  const response = await client.responses.create({
    model: 'gpt-5.1',
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
  return `You are an expert roofing analyst. Compare the insurance estimate against the roofing report for ${structureCount} roof structure(s). Treat the roofing report as the source of truth. Evaluate each structure independently.

Normalization and parsing rules:
- Units: convert squares (SQ) ↔ sqft using 1 SQ = 100 sqft. Linear measures are LF; areas are SF.
- Roofing report sources:
  * Total Squares: Prefer waste_table entry where waste_percent = 0% (use its "squares"). If missing, compute from measurements.total_roof_area (sqft / 100).
  * Eaves + Rakes: Prefer measurements.eaves_rakes; else sum measurements.total_eaves + measurements.total_rakes.
  * Hips + Ridges: Prefer sum of measurements.total_hips + measurements.total_ridges; else use measurements.hips_ridges.
  * Valleys SF: measurements.total_valleys (LF) × 6 ft width → SF.
  * Step flashing LF: measurements.total_wall_flashing + measurements.total_step_flashing.
  * Recommended waste %: the waste_table row where recommended = true; use its waste_percent as a percentage number.
- Insurance report sources:
  * Squares/Surface area: Use line items with unit "SQ" for shingles/surface area. If only surface area in sqft exists, convert to SQ via /100.
  * Tear off SQ: Use line items that represent tear-off/removal quantities in SQ.
  * Drip Edge, Starter Strip, Hip/Ridge Cap, Ice and Water Shield, Step Flashing: use their LF/SF quantities from the Roof section.
  * Felt/Underlayment: use felt/underlayment quantity (w/ or w/out felt); prefer SQ; if in sqft, convert to SQ.
  * Waste %: If present, extract from options_text (e.g., "Auto Calculated Waste: X%") or description (use for notes only; checkpoint 2 compares squares).
- Missing numeric buckets: Treat any unavailable pitch bucket as 0 for pitch-based checks.

Checklist (apply to EACH structure exactly as written below):
1. Confirm Total Squares
  - Roof report value: total squares at 0% waste (prefer waste_table 0% "squares"; else compute measurements.total_roof_area / 100).
  - Insurance report value: Tear off quantity in SQ (prefer explicit tear-off line items; if unit is sqft, convert to SQ). Do NOT use base/installation quantity for this checkpoint.
  - Status: Pass if Insurance tear-off SQ ≥ Roof 0% SQ; Failed if less; Missing if tear-off not found.

2. Check if proper waste factor is applied
  - Roof report value: squares at the recommended waste (use waste_table row where recommended=true → its "squares"; if only percent is present, compute squares = percent × roof 0% squares).
  - Insurance report value: felt/underlayment quantity (w/ or w/out felt) in SQ (convert from sqft if needed). Use the felt line item tied to the shingle scope for this roof.
  - Status: Pass if Insurance felt SQ ≥ Roof recommended waste SQ; Failed if less; Missing if unavailable.

3. Drip Edge
   - Compare roof eaves + rakes (LF) vs insurance drip edge (LF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

4. Starter Strip
   - Compare roof eaves + rakes (LF) vs insurance starter strip/asphalt starter/starter (LF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

5. Ridge Cap
   - Compare roof hips + ridges (LF) vs insurance hip/ridge cap (LF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.
   - Warning: If insurance mentions hip/ridge "cut from 3-tab", set a WARNING; otherwise null.

6. Ice and Water Shield in Valleys
   - Roof SF = total valley length × 6 ft; compare vs insurance ice and water shield/barrier (SF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

7. Step flashing
   - Present or not. If present: compare roof (total wall flashing + total step flashing) LF vs insurance step flashing (LF). Pass/Failed accordingly. If not present → Missing.

8. Chimney flashing
   - Presence check in insurance. Present → Pass; Missing → Missing with WARNING.

9. Ventilation items
   - Presence check in insurance (e.g., ridge vent, box/turtle/power/off-ridge vents). Present → Pass; Missing → Missing with WARNING.

10. Remove additional charge for steep roof 7/12 to 9/12 slope (Take off)
    - Roof SQ = sum of 7/12, 8/12, 9/12 pitch squares; compare vs insurance removal add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

11. Additional charge for steep roof 7/12 to 9/12 slope (Put back)
    - Roof SQ_put_back = (7/12 + 8/12 + 9/12 squares) + recommended waste % of that sum. Compare vs insurance add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

12. Remove additional charge for steep roof 10/12 and 12/12 slope (Take off)
    - Roof SQ = sum of 10/12 and 12/12 pitch squares; compare vs insurance removal add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

13. Additional charge for steep roof 10/12 and 12/12 slope (Put back)
    - Roof SQ_put_back = (10/12 + 12/12 squares) + recommended waste % of that sum. Compare vs insurance add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

14. Underlayment
    - Presence check in insurance. Present → Pass; Missing → Missing with WARNING.

Edge cases for pitch-based checkpoints (10–13):
- If the roof sum for the pitch group is 0 SQ:
  * If insurance shows a corresponding steep add-on (> 0), mark Failed (over-allowance) and note expected 0 SQ.
  * If insurance has no such add-on, mark Pass.
  * Always include the computed roof_report_value (e.g., "0 SQ").

General rules:
- Always use the roofing report as the source of truth.
- Flag under-allowances or missing items in the insurance report.
- Status must be one of: "pass", "failed", "missing".
- Provide clear notes showing the calculation/logic and any assumptions. Use WARNING only for notable caveats (e.g., ridge cut from 3-tab, missing chimney flashing/ventilation/underlayment); otherwise set warning = null.

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
          "roof_report_value": "string|null",  // Keep concise: "N.N SQ/LF/SF" only, no parenthetical notes
          "insurance_report_value": "string|null", // Keep concise: "N.N SQ/LF/SF" only
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

- Roofing report (source of truth)
- Insurance estimate (to be validated)

Your task: Compare the insurance estimate against the roofing report using the exact checklist below and return structured JSON.

Normalization and parsing rules:
- Units: 1 SQ = 100 sqft. Linear = LF; Area = SF.
- Roofing report sources:
  * Total Squares: Prefer waste_table where waste_percent = 0% (use its "squares"); else measurements.total_roof_area / 100.
  * Eaves + Rakes: measurements.eaves_rakes OR (total_eaves + total_rakes).
  * Hips + Ridges: (total_hips + total_ridges) OR hips_ridges.
  * Valleys SF: total_valleys (LF) × 6 ft.
  * Step flashing LF: total_wall_flashing + total_step_flashing.
  * Recommended waste %: waste_table row with recommended=true.
- Insurance report sources:
  * Squares/Surface: use SQ line items; else derive from sqft / 100.
  * Tear off SQ: removal/tear-off line items in SQ.
  * Drip Edge/Starter/Ridge Cap/IWS/Step Flashing: use their LF/SF quantities in the Roof section.
  * Felt/Underlayment: use felt/underlayment quantity (w/ or w/out felt), prefer SQ; if in sqft, convert to SQ.
  * Waste %: parse from options_text (e.g., "Auto Calculated Waste: X%") or description when present (use only for notes; compare squares for checkpoint 2).
- Missing pitch buckets are treated as 0 for pitch-based checks.

Checklist (single-structure):
1. Confirm Total Squares
  - Roof report value: total squares at 0% waste (prefer waste_table 0% "squares"; else compute measurements.total_roof_area / 100).
  - Insurance report value: Tear off quantity in SQ (prefer explicit tear-off line items; if unit is sqft, convert to SQ). Do NOT use base/installation quantity for this checkpoint.
  - Status: Pass if Insurance tear-off SQ ≥ Roof 0% SQ; Failed if less; Missing if tear-off not found.

2. Check if proper waste factor is applied
  - Roof report value: squares at the recommended waste (use waste_table row where recommended=true → its "squares"; if only percent is present, compute squares = percent × roof 0% squares).
  - Insurance report value: felt/underlayment quantity (w/ or w/out felt) in SQ (convert from sqft if needed). Use the felt line item tied to the shingle scope for this roof.
  - Status: Pass if Insurance felt SQ ≥ Roof recommended waste SQ; Failed if less; Missing if unavailable.

3. Drip Edge
   - Compare roof eaves + rakes (LF) vs insurance drip edge (LF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

4. Starter Strip
   - Compare roof eaves + rakes (LF) vs insurance starter strip/asphalt starter/starter (LF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

5. Ridge Cap
   - Compare roof hips + ridges (LF) vs insurance hip/ridge cap (LF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.
   - Warning: If insurance mentions hip/ridge "cut from 3-tab", set a WARNING; otherwise null.

6. Ice and Water Shield in Valleys
   - Roof SF = total valley length × 6 ft; compare vs insurance ice and water shield/barrier (SF). Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

7. Step flashing
   - Present or not. If present: compare roof (total wall flashing + total step flashing) LF vs insurance step flashing (LF). Pass/Failed accordingly. If not present → Missing.

8. Chimney flashing
   - Presence check in insurance. Present → Pass; Missing → Missing with WARNING.

9. Ventilation items
   - Presence check in insurance (e.g., ridge vent, box/turtle/power/off-ridge vents). Present → Pass; Missing → Missing with WARNING.

10. Remove additional charge for steep roof 7/12 to 9/12 slope (Take off)
    - Roof SQ = sum of 7/12, 8/12, 9/12 pitch squares; compare vs insurance removal add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

11. Additional charge for steep roof 7/12 to 9/12 slope (Put back)
    - Roof SQ_put_back = (7/12 + 8/12 + 9/12 squares) + recommended waste % of that sum. Compare vs insurance add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

12. Remove additional charge for steep roof 10/12 and 12/12 slope (Take off)
    - Roof SQ = sum of 10/12 and 12/12 pitch squares; compare vs insurance removal add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

13. Additional charge for steep roof 10/12 and 12/12 slope (Put back)
    - Roof SQ_put_back = (10/12 + 12/12 squares) + recommended waste % of that sum. Compare vs insurance add-on. Pass if Roof ≤ Insurance; Failed if less; Missing if insurance item missing.

14. Underlayment
    - Presence check in insurance. Present → Pass; Missing → Missing with WARNING.

Edge cases for pitch-based checkpoints (10–13):
- If the roof sum for the pitch group is 0 SQ:
  * If insurance shows a corresponding steep add-on (> 0), mark Failed (over-allowance) and note expected 0 SQ.
  * If insurance has no such add-on, mark Pass.
  * Always include the computed roof_report_value (e.g., "0 SQ").

General rules:
- Always use the roofing report as the source of truth.
- Flag under-allowances or missing items in the insurance report.
- Status must be one of: "pass", "failed", "missing".
- Provide clear notes showing the calculation/logic and any assumptions. Use WARNING only for notable caveats (e.g., ridge cut from 3-tab, missing chimney flashing/ventilation/underlayment); otherwise set warning = null.

JSON Output Schema
{
  "success": true,
  "structureCount": 1,
  "summary": { "pass": 0, "failed": 0, "missing": 0, "total": 0 },
  "comparisons": [
    {
      "checkpoint": "string",            // Exact name from the checklist
      "status": "pass" | "failed" | "missing",
      "roof_report_value": "string|null",  // Keep concise: "N.N SQ/LF/SF" only, no parenthetical notes
      "insurance_report_value": "string|null", // Keep concise: "N.N SQ/LF/SF" only
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
    model: 'gpt-5.1',
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
