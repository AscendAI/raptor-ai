'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { InsuranceReportData } from '@/lib/schemas/extraction';

interface InsuranceDataEditorProps {
  data: InsuranceReportData;
  onChange: (data: InsuranceReportData) => void;
}

export function InsuranceDataEditor({
  data,
  onChange,
}: InsuranceDataEditorProps) {
  const addSection = () => {
    const newSection = {
      section_name: '',
      line_items: [],
    };
    onChange({
      ...data,
      sections: [...data.sections, newSection],
    });
  };

  const removeSection = (index: number) => {
    onChange({
      ...data,
      sections: data.sections.filter((_, i) => i !== index),
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updated = data.sections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    );
    onChange({
      ...data,
      sections: updated,
    });
  };

  const addLineItem = (sectionIndex: number) => {
    const newLineItem = {
      item_no: data.sections[sectionIndex].line_items.length + 1,
      description: '',
      quantity: {
        value: null,
        unit: null,
      },
      options_text: null,
    };
    const updated = data.sections.map((section, i) =>
      i === sectionIndex
        ? { ...section, line_items: [...section.line_items, newLineItem] }
        : section
    );
    onChange({
      ...data,
      sections: updated,
    });
  };

  const removeLineItem = (sectionIndex: number, itemIndex: number) => {
    const updated = data.sections.map((section, i) =>
      i === sectionIndex
        ? {
            ...section,
            line_items: section.line_items.filter((_, j) => j !== itemIndex),
          }
        : section
    );
    onChange({
      ...data,
      sections: updated,
    });
  };

  const updateLineItem = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: string | number
  ) => {
    const updated = data.sections.map((section, i) =>
      i === sectionIndex
        ? {
            ...section,
            line_items: section.line_items.map((item, j) => {
              if (j === itemIndex) {
                if (field === 'quantity_value') {
                  return {
                    ...item,
                    quantity: {
                      ...item.quantity,
                      value: Number(value) || null,
                    },
                  };
                } else if (field === 'quantity_unit') {
                  return {
                    ...item,
                    quantity: {
                      ...item.quantity,
                      unit: (value as string) || null,
                    },
                  };
                } else {
                  return { ...item, [field]: value };
                }
              }
              return item;
            }),
          }
        : section
    );
    onChange({
      ...data,
      sections: updated,
    });
  };

  const basicFields = [
    { key: 'claim_id', label: 'Claim ID' },
    { key: 'date', label: 'Date' },
    { key: 'price_list', label: 'Price List' },
  ];

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 rounded-t-xl pt-6">
          <CardTitle className="text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <Plus className="h-5 w-5 text-slate-600" />
            </div>
            Basic Information
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            General insurance claim details and identification
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {basicFields.map((field) => (
              <div key={field.key} className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  {field.label}
                </Label>
                <Input
                  value={
                    (data[field.key as keyof InsuranceReportData] as string) ||
                    ''
                  }
                  onChange={(e) =>
                    onChange({ ...data, [field.key]: e.target.value })
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20 transition-colors"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b border-indigo-200 rounded-t-xl pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-200 rounded-lg">
                  <Plus className="h-5 w-5 text-indigo-600" />
                </div>
                Claim Sections
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Detailed breakdown of claim sections and line items for
                comprehensive analysis
              </CardDescription>
            </div>
            <Button
              onClick={addSection}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            {data.sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800 border-indigo-200 px-3 py-1"
                  >
                    Section {sectionIndex + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Section Name
                    </Label>
                    <Input
                      value={section.section_name}
                      onChange={(e) =>
                        updateSection(
                          sectionIndex,
                          'section_name',
                          e.target.value
                        )
                      }
                      placeholder="Enter section name"
                      className="h-11 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Line Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="p-1 bg-slate-300 rounded">
                          <Plus className="h-3 w-3 text-slate-600" />
                        </div>
                        Line Items
                      </h4>
                      <Button
                        onClick={() => addLineItem(sectionIndex)}
                        size="sm"
                        variant="outline"
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    {section.line_items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-700 border-slate-300"
                          >
                            Item {itemIndex + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeLineItem(sectionIndex, itemIndex)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">
                              Item No.
                            </Label>
                            <Input
                              value={item.item_no}
                              onChange={(e) =>
                                updateLineItem(
                                  sectionIndex,
                                  itemIndex,
                                  'item_no',
                                  Number(e.target.value)
                                )
                              }
                              placeholder="Item number"
                              className="h-10 text-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                              type="number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">
                              Description
                            </Label>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateLineItem(
                                  sectionIndex,
                                  itemIndex,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder="Item description"
                              className="h-10 text-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">
                              Quantity Value
                            </Label>
                            <Input
                              value={item.quantity.value || ''}
                              onChange={(e) =>
                                updateLineItem(
                                  sectionIndex,
                                  itemIndex,
                                  'quantity_value',
                                  e.target.value
                                )
                              }
                              placeholder="Quantity value"
                              className="h-10 text-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                              type="number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">
                              Quantity Unit
                            </Label>
                            <Input
                              value={item.quantity.unit || ''}
                              onChange={(e) =>
                                updateLineItem(
                                  sectionIndex,
                                  itemIndex,
                                  'quantity_unit',
                                  e.target.value
                                )
                              }
                              placeholder="Unit (e.g., sq ft)"
                              className="h-10 text-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-700">
                            Options Text
                          </Label>
                          <Input
                            value={item.options_text || ''}
                            onChange={(e) =>
                              updateLineItem(
                                sectionIndex,
                                itemIndex,
                                'options_text',
                                e.target.value
                              )
                            }
                            placeholder="Additional options or notes"
                            className="h-10 text-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    ))}

                    {section.line_items.length === 0 && (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-slate-300">
                        <div className="p-3 bg-slate-200 rounded-full w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                          <Plus className="h-5 w-5 text-slate-500" />
                        </div>
                        <p className="text-slate-600 font-medium text-sm mb-1">
                          No line items added yet
                        </p>
                        <p className="text-slate-500 text-xs">
                          Click &ldquo;Add Item&rdquo; to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {data.sections.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <div className="p-3 bg-slate-200 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium mb-2">
                  No sections added yet
                </p>
                <p className="text-slate-500 text-sm">
                  Click &ldquo;Add Section&rdquo; to get started with claim
                  organization
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InsuranceDataEditor;
