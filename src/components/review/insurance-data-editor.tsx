'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export function InsuranceDataEditor({ data, onChange }: InsuranceDataEditorProps) {
  const addSection = () => {
    const newSection = {
      section_name: '',
      line_items: []
    };
    onChange({
      ...data,
      sections: [...data.sections, newSection]
    });
  };

  const removeSection = (index: number) => {
    onChange({
      ...data,
      sections: data.sections.filter((_, i) => i !== index)
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updated = data.sections.map((section, i) => 
      i === index ? { ...section, [field]: value } : section
    );
    onChange({
      ...data,
      sections: updated
    });
  };

  const addLineItem = (sectionIndex: number) => {
    const newLineItem = {
      item_no: data.sections[sectionIndex].line_items.length + 1,
      description: '',
      quantity: {
        value: null,
        unit: null
      },
      options_text: null
    };
    const updated = data.sections.map((section, i) => 
      i === sectionIndex 
        ? { ...section, line_items: [...section.line_items, newLineItem] }
        : section
    );
    onChange({
      ...data,
      sections: updated
    });
  };

  const removeLineItem = (sectionIndex: number, itemIndex: number) => {
    const updated = data.sections.map((section, i) => 
      i === sectionIndex 
        ? { ...section, line_items: section.line_items.filter((_, j) => j !== itemIndex) }
        : section
    );
    onChange({
      ...data,
      sections: updated
    });
  };

  const updateLineItem = (sectionIndex: number, itemIndex: number, field: string, value: string | number) => {
    const updated = data.sections.map((section, i) => 
      i === sectionIndex 
        ? {
            ...section,
            line_items: section.line_items.map((item, j) => {
              if (j === itemIndex) {
                if (field === 'quantity_value') {
                  return { ...item, quantity: { ...item.quantity, value: Number(value) || null } };
                } else if (field === 'quantity_unit') {
                  return { ...item, quantity: { ...item.quantity, unit: value as string || null } };
                } else {
                  return { ...item, [field]: value };
                }
              }
              return item;
            })
          }
        : section
    );
    onChange({
      ...data,
      sections: updated
    });
  };

  const basicFields = [
    { key: 'claim_id', label: 'Claim ID' },
    { key: 'date', label: 'Date' },
    { key: 'price_list', label: 'Price List' }
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            General insurance claim details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={data[field.key as keyof InsuranceReportData] as string || ''}
                  onChange={(e) => onChange({ ...data, [field.key]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Claim Sections</CardTitle>
              <CardDescription>
                Detailed breakdown of claim sections and line items
              </CardDescription>
            </div>
            <Button onClick={addSection} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">Section {sectionIndex + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Name</Label>
                    <Input
                      value={section.section_name}
                      onChange={(e) => updateSection(sectionIndex, 'section_name', e.target.value)}
                      placeholder="Enter section name"
                    />
                  </div>

                  {/* Line Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Line Items</h4>
                      <Button 
                        onClick={() => addLineItem(sectionIndex)} 
                        size="sm" 
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    {section.line_items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">Item {itemIndex + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(sectionIndex, itemIndex)}
                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Item No.</Label>
                            <Input
                              value={item.item_no}
                              onChange={(e) => updateLineItem(sectionIndex, itemIndex, 'item_no', Number(e.target.value))}
                              placeholder="Item number"
                              className="h-8 text-sm"
                              type="number"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(sectionIndex, itemIndex, 'description', e.target.value)}
                              placeholder="Item description"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Quantity Value</Label>
                            <Input
                              value={item.quantity.value || ''}
                              onChange={(e) => updateLineItem(sectionIndex, itemIndex, 'quantity_value', e.target.value)}
                              placeholder="Quantity value"
                              className="h-8 text-sm"
                              type="number"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Quantity Unit</Label>
                            <Input
                              value={item.quantity.unit || ''}
                              onChange={(e) => updateLineItem(sectionIndex, itemIndex, 'quantity_unit', e.target.value)}
                              placeholder="Unit (e.g., sq ft)"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Options Text</Label>
                            <Input
                              value={item.options_text || ''}
                              onChange={(e) => updateLineItem(sectionIndex, itemIndex, 'options_text', e.target.value)}
                              placeholder="Additional options or notes"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {section.line_items.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No line items added yet. Click Add Item to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {data.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sections added yet. Click Add Section to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InsuranceDataEditor;