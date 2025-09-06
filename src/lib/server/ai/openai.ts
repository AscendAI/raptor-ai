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

export async function analyseInsuranceReport(insuranceReportImages: string[]) {
  const response = await client.responses.create({
    model: 'gpt-5-mini',
    instructions: 'You are insurance report analyser. You will be given a list of images of an insurance report. You will need to analyse the images and return a summary of the report.',
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