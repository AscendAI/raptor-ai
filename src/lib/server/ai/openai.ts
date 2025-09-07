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
`

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
          detail: "high"
        }))
      }
    ],
  });
  console.log(JSON.stringify(response.usage, null, 2))
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
`

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
          detail: "high"
        }))
      }
    ],
  });
  return response.output_text;
}

const reportComparisonPrompt = `
I have this analysis of a roofing report of a company fixing roof of a client and an insurance report of the client's insurance company.
Assume that the roofing report is always correct but the insurance company report may make mistakes.
Compare the reports to find inaccuracies of the insurance allowance.

These are the common things a roofing report may miss:
1. Confirm Total Squares and Waste Factor. Compare insurance estimate squares to Roofr/EagleView report. Ensure proper waste factor (10–15%) applied
2. Drip Edge. Required by code at all eaves + rakes. Cannot be reused; must be new
3. Starter Strip. Required at eaves + rakes; not cut from field shingles. Manufacturer warranty requirement
4. Ridge Cap. Must use manufacturer ridge cap if architectural shingles. Ensure ridge footage matches report
5. Ice & Water Shield in Valleys. Required by IRC; standard valley liner. Calculate length × 6 ft width
6. Step Flashing. Required at roof-to-wall intersections. Cannot be reused per manufacturer guidance
7. Chimney Flashing. Required if chimney is present. Includes base flashing, counter flashing, and cricket if wider than 30 inches
8. Ventilation Items. Count turtle vents, ridge vents, exhaust caps, flue caps. Must match existing ventilation system
9. Steep/High Charges. Apply for 7/12–9/12 and 10/12+ pitches. Add high charge if 2+ story access required
10. Underlayment Type. Confirm if synthetic required; adjusters default to felt. Document manufacturer/code requirement`

export async function analyseComparison(roofReportAnalysis: string, insuranceReportAnalysis: string) {
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    instructions: reportComparisonPrompt,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Roof Report Analysis: ${roofReportAnalysis}\n\nInsurance Report Analysis: ${insuranceReportAnalysis}`
          }
        ]
      }
    ],
  });
  return response.output_text;
}