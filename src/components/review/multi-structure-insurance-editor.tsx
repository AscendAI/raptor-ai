'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Edit3, Plus, Trash2 } from 'lucide-react';
import { InsuranceReportData } from '@/lib/types/extraction';

interface MultiStructureInsuranceEditorProps {
  data: InsuranceReportData;
  onChange: (data: InsuranceReportData) => void;
}

export function MultiStructureInsuranceEditor({
  data,
  onChange,
}: MultiStructureInsuranceEditorProps) {
  const [activeTab, setActiveTab] = useState(
    data.roofSections.length > 0
      ? `roof-${data.roofSections[0].roofNumber}`
      : 'roof-1'
  );

  const updateClaimInfo = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const addRoofSection = () => {
    const newRoofNumber =
      Math.max(...data.roofSections.map((r) => r.roofNumber), 0) + 1;
    const newSection = {
      roofNumber: newRoofNumber,
      section_name: `Roof${newRoofNumber}`,
      line_items: [],
    };
    onChange({
      ...data,
      roofSections: [...data.roofSections, newSection],
    });
    setActiveTab(`roof-${newRoofNumber}`);
  };

  const removeRoofSection = (roofNumber: number) => {
    const updatedSections = data.roofSections.filter(
      (section) => section.roofNumber !== roofNumber
    );
    onChange({
      ...data,
      roofSections: updatedSections,
    });

    // Switch to first available tab if current tab was removed
    if (activeTab === `roof-${roofNumber}` && updatedSections.length > 0) {
      setActiveTab(`roof-${updatedSections[0].roofNumber}`);
    }
  };

  const updateRoofSection = (
    roofNumber: number,
    field: string,
    value: string
  ) => {
    const updatedSections = data.roofSections.map((section) =>
      section.roofNumber === roofNumber
        ? { ...section, [field]: value }
        : section
    );
    onChange({
      ...data,
      roofSections: updatedSections,
    });
  };

  const addLineItem = (roofNumber: number) => {
    const updatedSections = data.roofSections.map((section) => {
      if (section.roofNumber === roofNumber) {
        const newItemNo =
          Math.max(...section.line_items.map((item) => item.item_no), 0) + 1;
        const newLineItem = {
          item_no: newItemNo,
          description: '',
          quantity: {
            value: null as number | null,
            unit: null as string | null,
          },
          options_text: null as string | null,
        };
        return {
          ...section,
          line_items: [...section.line_items, newLineItem],
        };
      }
      return section;
    });
    onChange({
      ...data,
      roofSections: updatedSections,
    });
  };

  const removeLineItem = (roofNumber: number, itemNo: number) => {
    const updatedSections = data.roofSections.map((section) => {
      if (section.roofNumber === roofNumber) {
        return {
          ...section,
          line_items: section.line_items.filter(
            (item) => item.item_no !== itemNo
          ),
        };
      }
      return section;
    });
    onChange({
      ...data,
      roofSections: updatedSections,
    });
  };

  const updateLineItem = (
    roofNumber: number,
    itemNo: number,
    field: string,
    value: string | number | null
  ) => {
    const updatedSections = data.roofSections.map((section) => {
      if (section.roofNumber === roofNumber) {
        const updatedLineItems = section.line_items.map((item) => {
          if (item.item_no === itemNo) {
            if (field === 'quantity.value') {
              // Ensure quantity.value is number | null
              const numericValue =
                typeof value === 'string' ? parseFloat(value) || null : value;
              return {
                ...item,
                quantity: {
                  ...item.quantity,
                  value: numericValue as number | null,
                },
              };
            } else if (field === 'quantity.unit') {
              // Ensure quantity.unit is string | null
              return {
                ...item,
                quantity: {
                  ...item.quantity,
                  unit: value as string | null,
                },
              };
            } else {
              return { ...item, [field]: value as string };
            }
          }
          return item;
        });
        return { ...section, line_items: updatedLineItems };
      }
      return section;
    });
    onChange({
      ...data,
      roofSections: updatedSections,
    });
  };

  return (
    <div className="space-y-6">
      {/* Claim Information */}
      <Card className="shadow-sm border-slate-200 py-0 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-300 border-b border-slate-200 rounded-t-xl pt-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-slate-200 rounded-lg">
              <Edit3 className="h-5 w-5 text-slate-600" />
            </div>
            Claim Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="claim_id"
                className="text-sm font-medium text-slate-700"
              >
                Claim ID
              </Label>
              <Input
                id="claim_id"
                type="text"
                value={data.claim_id}
                onChange={(e) => updateClaimInfo('claim_id', e.target.value)}
                className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                placeholder="Enter claim ID"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-sm font-medium text-slate-700"
              >
                Date
              </Label>
              <Input
                id="date"
                type="text"
                value={data.date}
                onChange={(e) => updateClaimInfo('date', e.target.value)}
                className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                placeholder="Enter date"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="price_list"
                className="text-sm font-medium text-slate-700"
              >
                Price List
              </Label>
              <Input
                id="price_list"
                type="text"
                value={data.price_list}
                onChange={(e) => updateClaimInfo('price_list', e.target.value)}
                className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                placeholder="Enter price list"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roof Sections */}
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 rounded-t-xl pt-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              Roof Sections
              <Badge variant="secondary" className="ml-2">
                {data.roofSections.length} Section
                {data.roofSections.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              onClick={addRoofSection}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardTitle>
          <CardDescription className="text-slate-600">
            Manage line items for each roof section individually
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data.roofSections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                No roof sections found. Add a section to get started.
              </p>
              <Button onClick={addRoofSection} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${data.roofSections.length}, 1fr)`,
                }}
              >
                {data.roofSections.map((section) => (
                  <TabsTrigger
                    key={`roof-${section.roofNumber}`}
                    value={`roof-${section.roofNumber}`}
                    className="text-sm"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    {section.section_name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {data.roofSections.map((section) => (
                <TabsContent
                  key={`roof-${section.roofNumber}`}
                  value={`roof-${section.roofNumber}`}
                  className="mt-6"
                >
                  <div className="space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-800">
                          {section.section_name} Details
                        </h3>
                      </div>
                      {data.roofSections.length > 1 && (
                        <Button
                          onClick={() => removeRoofSection(section.roofNumber)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Section
                        </Button>
                      )}
                    </div>

                    {/* Section Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Section Name
                      </Label>
                      <Input
                        type="text"
                        value={section.section_name}
                        onChange={(e) =>
                          updateRoofSection(
                            section.roofNumber,
                            'section_name',
                            e.target.value
                          )
                        }
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter section name"
                      />
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-slate-700">
                          Line Items
                        </h4>
                        <Button
                          onClick={() => addLineItem(section.roofNumber)}
                          size="sm"
                          variant="outline"
                          className="border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Line Item
                        </Button>
                      </div>

                      {section.line_items.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                          <p className="text-slate-500 mb-2">
                            No line items in this section
                          </p>
                          <Button
                            onClick={() => addLineItem(section.roofNumber)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Line Item
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {section.line_items.map((item) => (
                            <div
                              key={item.item_no}
                              className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50"
                            >
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Item No.
                                </Label>
                                <Input
                                  type="number"
                                  value={item.item_no}
                                  onChange={(e) =>
                                    updateLineItem(
                                      section.roofNumber,
                                      item.item_no,
                                      'item_no',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Description
                                </Label>
                                <Input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateLineItem(
                                      section.roofNumber,
                                      item.item_no,
                                      'description',
                                      e.target.value
                                    )
                                  }
                                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Item description"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Quantity
                                </Label>
                                <Input
                                  type="number"
                                  value={item.quantity.value || ''}
                                  onChange={(e) =>
                                    updateLineItem(
                                      section.roofNumber,
                                      item.item_no,
                                      'quantity.value',
                                      parseFloat(e.target.value) || null
                                    )
                                  }
                                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Qty"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  Unit
                                </Label>
                                <Input
                                  type="text"
                                  value={item.quantity.unit || ''}
                                  onChange={(e) =>
                                    updateLineItem(
                                      section.roofNumber,
                                      item.item_no,
                                      'quantity.unit',
                                      e.target.value || null
                                    )
                                  }
                                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Unit"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeLineItem(
                                      section.roofNumber,
                                      item.item_no
                                    )
                                  }
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
