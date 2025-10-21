'use client';

import React from 'react';
import { InsuranceReportData } from '@/lib/types/extraction';
import { MeasurementsSection, LineItemsSection } from './shared';

interface SingleStructureInsuranceEditorProps {
  data: InsuranceReportData;
  onChange: (data: InsuranceReportData) => void;
}

export function SingleStructureInsuranceEditor({
  data,
  onChange,
}: SingleStructureInsuranceEditorProps) {
  const addSection = () => {
    const newSection = {
      roofNumber: data.roofSections.length + 1,
      section_name: '',
      line_items: [],
    };
    onChange({
      ...data,
      roofSections: [...data.roofSections, newSection],
    });
  };

  const removeSection = (index: number) => {
    onChange({
      ...data,
      roofSections: data.roofSections.filter((_, i) => i !== index),
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updated = data.roofSections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    );
    onChange({
      ...data,
      roofSections: updated,
    });
  };

  const addLineItem = (sectionIndex: number) => {
    const newItem = {
      item_no: 1,
      description: '',
      quantity: {
        value: null as number | null,
        unit: null as string | null,
      },
      options_text: null as string | null,
    };
    const updated = data.roofSections.map((section, i) =>
      i === sectionIndex
        ? { ...section, line_items: [...section.line_items, newItem] }
        : section
    );
    onChange({
      ...data,
      roofSections: updated,
    });
  };

  const removeLineItem = (sectionIndex: number, itemIndex: number) => {
    const updated = data.roofSections.map((section, i) =>
      i === sectionIndex
        ? {
            ...section,
            line_items: section.line_items.filter((_, j) => j !== itemIndex),
          }
        : section
    );
    onChange({
      ...data,
      roofSections: updated,
    });
  };

  const updateLineItem = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: string | number | null
  ) => {
    const updatedSections = data.roofSections.map((section, i) => {
      if (i !== sectionIndex) return section;

      return {
        ...section,
        line_items: section.line_items.map((item, j) => {
          if (j !== itemIndex) return item;

          if (field === 'quantity.value') {
            return {
              ...item,
              quantity: { ...item.quantity, value: value as number | null },
            };
          }

          if (field === 'quantity.unit') {
            return {
              ...item,
              quantity: { ...item.quantity, unit: value as string | null },
            };
          }

          return { ...item, [field]: value };
        }),
      };
    });

    onChange({
      ...data,
      roofSections: updatedSections,
    });
  };

  const updateBasicField = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const basicFields = [
    { key: 'claim_id', label: 'Claim ID' },
    { key: 'date', label: 'Date' },
    { key: 'price_list', label: 'Price List' },
  ];

  // Convert basic fields to measurements format
  const basicMeasurements: Record<string, string | null | undefined> = {};
  basicFields.forEach((field) => {
    basicMeasurements[field.key] =
      (data[field.key as keyof InsuranceReportData] as string) || '';
  });

  return (
    <div className="space-y-8">
      <MeasurementsSection
        measurements={basicMeasurements}
        onUpdate={updateBasicField}
        fields={basicFields}
        title="Basic Information"
        description="General insurance claim details and identification"
        variant="secondary"
      />

      <LineItemsSection
        sections={data.roofSections}
        onAddSection={addSection}
        onRemoveSection={removeSection}
        onUpdateSection={updateSection}
        onAddLineItem={addLineItem}
        onRemoveLineItem={removeLineItem}
        onUpdateLineItem={updateLineItem}
        variant="primary"
      />
    </div>
  );
}
