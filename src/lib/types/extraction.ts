// TypeScript interfaces for extracted data structures

// Single structure data (legacy format for backward compatibility)
export interface SingleRoofReportData {
  measurements: {
    total_roof_area?: string | null;
    total_pitched_area?: string | null;
    total_flat_area?: string | null;
    total_roof_facets?: string | null;
    predominant_pitch?: string | null;
    total_eaves?: string | null;
    total_valleys?: string | null;
    total_hips?: string | null;
    total_ridges?: string | null;
    total_rakes?: string | null;
    total_wall_flashing?: string | null;
    total_step_flashing?: string | null;
    total_transitions?: string | null;
    total_parapet_wall?: string | null;
    total_unspecified?: string | null;
    hips_ridges?: string | null;
    eaves_rakes?: string | null;
    [key: string]: string | null | undefined; // Allow additional measurements
  };
  pitch_breakdown: Array<{
    pitch: string;
    area_sqft: string;
    squares: string;
  }>;
  waste_table: Array<{
    waste_percent: string;
    area_sqft: string;
    squares: string;
    recommended: boolean;
  }>;
}

// Multi-structure roof report data
export interface RoofReportData {
  structureCount: number;
  structures: Array<{
    structureNumber: number;
    measurements: {
      total_roof_area?: string | null;
      total_pitched_area?: string | null;
      total_flat_area?: string | null;
      total_roof_facets?: string | null;
      predominant_pitch?: string | null;
      total_eaves?: string | null;
      total_valleys?: string | null;
      total_hips?: string | null;
      total_ridges?: string | null;
      total_rakes?: string | null;
      total_wall_flashing?: string | null;
      total_step_flashing?: string | null;
      total_transitions?: string | null;
      total_parapet_wall?: string | null;
      total_unspecified?: string | null;
      hips_ridges?: string | null;
      eaves_rakes?: string | null;
      [key: string]: string | null | undefined; // Allow additional measurements
    };
    pitch_breakdown: Array<{
      pitch: string;
      area_sqft: string;
      squares: string;
    }>;
    waste_table: Array<{
      waste_percent: string;
      area_sqft: string;
      squares: string;
      recommended: boolean;
    }>;
  }>;
}

export interface InsuranceReportData {
  claim_id: string;
  date: string;
  price_list: string;
  structureCount: number;
  roofSections: Array<{
    roofNumber: number;
    section_name: string; // e.g., "Roof1", "Roof2", etc.
    line_items: Array<{
      item_no: number;
      description: string;
      quantity: {
        value: number | null;
        unit: string | null;
      };
      options_text: string | null;
    }>;
  }>;
}

export interface ExtractionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  rawText?: string;
}

// Parsing functions with error handling
export function parseRoofReportData(rawText: string): ExtractionResult<RoofReportData> {
  try {
    // Clean the text - remove any markdown formatting or extra text
    const cleanText = rawText.trim();
    let jsonText = cleanText;
    
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Try to find JSON object boundaries
    const startIndex = jsonText.indexOf('{');
    const lastIndex = jsonText.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, lastIndex + 1);
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Check if this is the legacy single structure format
    if (parsed.measurements && parsed.pitch_breakdown && parsed.waste_table && !parsed.structureCount) {
      // Convert legacy format to multi-structure format
      const legacyData = parsed as SingleRoofReportData;
      const multiStructureData: RoofReportData = convertLegacyToMultiStructure(legacyData);
      
      return {
        success: true,
        data: multiStructureData,
        rawText
      };
    }
    
    // Validate multi-structure format
    const multiStructureData = parsed as RoofReportData;
    if (!multiStructureData.structureCount || !Array.isArray(multiStructureData.structures)) {
      throw new Error('Invalid roof report structure - missing structureCount or structures array');
    }
    
    return {
      success: true,
      data: multiStructureData,
      rawText
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      rawText
    };
  }
}

export function parseInsuranceReportData(rawText: string): ExtractionResult<InsuranceReportData> {
  try {
    // Clean the text - remove any markdown formatting or extra text
    const cleanText = rawText.trim();
    let jsonText = cleanText;
    
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Try to find JSON object boundaries
    const startIndex = jsonText.indexOf('{');
    const lastIndex = jsonText.lastIndexOf('}');
    
    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, lastIndex + 1);
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Check if this is legacy single-structure format (has 'sections' instead of 'roofSections')
    if (parsed.sections && !parsed.roofSections && !parsed.structureCount) {
      // Convert legacy format to multi-structure format
      const convertedData: InsuranceReportData = {
        claim_id: parsed.claim_id,
        date: parsed.date,
        price_list: parsed.price_list,
        structureCount: 1,
        roofSections: parsed.sections.map((section: { section_name?: string; line_items?: unknown[] }, index: number) => ({
          roofNumber: index + 1,
          section_name: section.section_name || 'Roof',
          line_items: section.line_items || []
        }))
      };
      
      return {
        success: true,
        data: convertedData,
        rawText
      };
    }
    
    // Validate multi-structure format
    if (!parsed.claim_id || !parsed.date || !Array.isArray(parsed.roofSections)) {
      throw new Error('Invalid insurance report structure - missing required fields or roofSections array');
    }
    
    return {
      success: true,
      data: parsed as InsuranceReportData,
      rawText
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      rawText
    };
  }
}

// Helper function to convert parsed data back to string for AI comparison
export function stringifyForComparison(roofData: RoofReportData, insuranceData: InsuranceReportData): {
  roofReportText: string;
  insuranceReportText: string;
} {
  return {
    roofReportText: JSON.stringify(roofData, null, 2),
    insuranceReportText: JSON.stringify(insuranceData, null, 2)
  };
}

// Utility functions for backward compatibility
export function convertLegacyToMultiStructure(legacyData: SingleRoofReportData): RoofReportData {
  return {
    structureCount: 1,
    structures: [{
      structureNumber: 1,
      measurements: legacyData.measurements,
      pitch_breakdown: legacyData.pitch_breakdown,
      waste_table: legacyData.waste_table
    }]
  };
}

export function convertMultiToLegacyStructure(multiData: RoofReportData): SingleRoofReportData | null {
  if (multiData.structureCount !== 1 || multiData.structures.length !== 1) {
    return null; // Cannot convert multi-structure to legacy format
  }
  
  const structure = multiData.structures[0];
  return {
    measurements: structure.measurements,
    pitch_breakdown: structure.pitch_breakdown,
    waste_table: structure.waste_table
  };
}