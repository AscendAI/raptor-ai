import { RoofReportData, InsuranceReportData } from '@/lib/types/extraction';

export interface ValidationError {
  field: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validation for roof report data
export function validateRoofData(data: RoofReportData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate each structure
  data.structures.forEach((structure, structureIndex) => {
    // Validate measurements - check for reasonable numeric values
    if (structure.measurements) {
      Object.entries(structure.measurements).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push({
              field: `structures[${structureIndex}].measurements.${key}`,
              message: `${key.replace(/_/g, ' ')} must be a valid number`,
              path: `structures.${structureIndex}.measurements.${key}`,
            });
          } else if (numValue < 0) {
            errors.push({
              field: `structures[${structureIndex}].measurements.${key}`,
              message: `${key.replace(/_/g, ' ')} cannot be negative`,
              path: `structures.${structureIndex}.measurements.${key}`,
            });
          } else if (numValue > 100000) {
            errors.push({
              field: `structures[${structureIndex}].measurements.${key}`,
              message: `${key.replace(/_/g, ' ')} seems unusually large (>100,000)`,
              path: `structures.${structureIndex}.measurements.${key}`,
            });
          }
        }
      });
    }

    // Validate pitch breakdown
    structure.pitch_breakdown.forEach((pitch, index) => {
      if (!pitch.pitch || pitch.pitch.trim() === '') {
        errors.push({
          field: `structures[${structureIndex}].pitch_breakdown[${index}].pitch`,
          message: 'Pitch value is required',
          path: `structures.${structureIndex}.pitch_breakdown.${index}.pitch`,
        });
      }

      if (pitch.area_sqft) {
        const area = parseFloat(pitch.area_sqft);
        if (isNaN(area) || area < 0) {
          errors.push({
            field: `structures[${structureIndex}].pitch_breakdown[${index}].area_sqft`,
            message: 'Area must be a valid positive number',
            path: `structures.${structureIndex}.pitch_breakdown.${index}.area_sqft`,
          });
        }
      }

      if (pitch.squares) {
        const squares = parseFloat(pitch.squares);
        if (isNaN(squares) || squares < 0) {
          errors.push({
            field: `structures[${structureIndex}].pitch_breakdown[${index}].squares`,
            message: 'Squares must be a valid positive number',
            path: `structures.${structureIndex}.pitch_breakdown.${index}.squares`,
          });
        }
      }
    });

    // Validate waste table
    structure.waste_table.forEach((item, index) => {
      if (item.waste_percent) {
        const percent = parseFloat(item.waste_percent);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          errors.push({
            field: `structures[${structureIndex}].waste_table[${index}].waste_percent`,
            message: 'Waste percent must be between 0 and 100',
            path: `structures.${structureIndex}.waste_table.${index}.waste_percent`,
          });
        }
      }

      if (item.area_sqft) {
        const area = parseFloat(item.area_sqft);
        if (isNaN(area) || area < 0) {
          errors.push({
            field: `structures[${structureIndex}].waste_table[${index}].area_sqft`,
            message: 'Area must be a valid positive number',
            path: `structures.${structureIndex}.waste_table.${index}.area_sqft`,
          });
        }
      }

      if (item.squares) {
        const squares = parseFloat(item.squares);
        if (isNaN(squares) || squares < 0) {
          errors.push({
            field: `structures[${structureIndex}].waste_table[${index}].squares`,
            message: 'Squares must be a valid positive number',
            path: `structures.${structureIndex}.waste_table.${index}.squares`,
          });
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validation for insurance report data
export function validateInsuranceData(
  data: InsuranceReportData
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate basic fields
  if (!data.claim_id || data.claim_id.trim() === '') {
    errors.push({
      field: 'claim_id',
      message: 'Claim ID is required',
      path: 'claim_id',
    });
  }

  if (!data.date || data.date.trim() === '') {
    errors.push({
      field: 'date',
      message: 'Date is required',
      path: 'date',
    });
  } else {
    // Basic date format validation
    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{1,2}-\d{1,2}-\d{4}$/;
    if (!dateRegex.test(data.date)) {
      errors.push({
        field: 'date',
        message:
          'Date must be in a valid format (YYYY-MM-DD, MM/DD/YYYY, or MM-DD-YYYY)',
        path: 'date',
      });
    }
  }

  // Validate sections
  if (data.roofSections.length === 0) {
    errors.push({
      field: 'roofSections',
      message: 'At least one section is required',
      path: 'roofSections',
    });
  }

  data.roofSections.forEach((section, sectionIndex) => {
    if (!section.section_name || section.section_name.trim() === '') {
      errors.push({
        field: `roofSections[${sectionIndex}].section_name`,
        message: 'Section name is required',
        path: `roofSections.${sectionIndex}.section_name`,
      });
    }

    // Validate line items
    section.line_items.forEach((item, itemIndex) => {
      if (item.item_no <= 0) {
        errors.push({
          field: `roofSections[${sectionIndex}].line_items[${itemIndex}].item_no`,
          message: 'Item number must be greater than 0',
          path: `roofSections.${sectionIndex}.line_items.${itemIndex}.item_no`,
        });
      }

      if (!item.description || item.description.trim() === '') {
        errors.push({
          field: `roofSections[${sectionIndex}].line_items[${itemIndex}].description`,
          message: 'Item description is required',
          path: `roofSections.${sectionIndex}.line_items.${itemIndex}.description`,
        });
      }

      if (item.quantity.value !== null && item.quantity.value < 0) {
        errors.push({
          field: `roofSections[${sectionIndex}].line_items[${itemIndex}].quantity.value`,
          message: 'Quantity value cannot be negative',
          path: `roofSections.${sectionIndex}.line_items.${itemIndex}.quantity.value`,
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Combined validation for both datasets
export function validateReviewData(
  roofData: RoofReportData,
  insuranceData: InsuranceReportData
): ValidationResult {
  const roofValidation = validateRoofData(roofData);
  const insuranceValidation = validateInsuranceData(insuranceData);

  return {
    isValid: roofValidation.isValid && insuranceValidation.isValid,
    errors: [...roofValidation.errors, ...insuranceValidation.errors],
  };
}

// Helper function to get field-specific errors
export function getFieldErrors(
  errors: ValidationError[],
  fieldPath: string
): ValidationError[] {
  return errors.filter((error) => error.path === fieldPath);
}

// Helper function to check if a specific field has errors
export function hasFieldError(
  errors: ValidationError[],
  fieldPath: string
): boolean {
  return errors.some((error) => error.path === fieldPath);
}
