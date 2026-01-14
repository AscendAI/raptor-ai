'use client';

import { SectionCard } from './section-card';
import { FormField } from './form-field';
import { DataRow } from './data-row';
import { AddButton } from './add-button';
import { EmptyState } from './empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Plus } from 'lucide-react';

interface LineItem {
  item_no: number;
  description: string;
  quantity: {
    value: number | null;
    unit: string | null;
  };
  options_text: string | null;
}

interface Section {
  roofNumber: number;
  section_name: string;
  line_items: LineItem[];
}

interface LineItemsSectionProps {
  sections: Section[];
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onUpdateSection: (index: number, field: string, value: string) => void;
  onAddLineItem: (sectionIndex: number) => void;
  onRemoveLineItem: (sectionIndex: number, itemIndex: number) => void;
  onUpdateLineItem: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: string | number | null
  ) => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function LineItemsSection({
  sections,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onAddLineItem,
  onRemoveLineItem,
  onUpdateLineItem,
  title = 'Claim Sections',
  description = 'Detailed breakdown of claim sections and line items for comprehensive analysis',
  variant = 'primary',
}: LineItemsSectionProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={<Plus className="h-5 w-5" />}
      variant={variant}
    >
      <div className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
          >
            <DataRow
              badge={
                <Badge variant="secondary">Section {sectionIndex + 1}</Badge>
              }
              onRemove={() => onRemoveSection(sectionIndex)}
              gridClassName="grid-cols-1"
            >
              <FormField
                label="Section Name"
                value={section.section_name}
                onChange={(value) =>
                  onUpdateSection(sectionIndex, 'section_name', value)
                }
                placeholder="Enter section name"
                className="col-span-4"
              />
            </DataRow>

            {/* Line Items */}
            <div className="space-y-4 mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="p-1 bg-slate-300 rounded">
                    <FileText className="h-3 w-3 text-slate-600" />
                  </div>
                  Line Items
                </h4>
              </div>

              {section.line_items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
                >
                  <DataRow
                    badge={
                      <Badge variant="outline">Item {itemIndex + 1}</Badge>
                    }
                    onRemove={() => onRemoveLineItem(sectionIndex, itemIndex)}
                    gridClassName="grid-cols-1"
                  >
                    <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Item No."
                        value={item.item_no.toString()}
                        onChange={(value) =>
                          onUpdateLineItem(
                            sectionIndex,
                            itemIndex,
                            'item_no',
                            Number(value) || 0
                          )
                        }
                        placeholder="Item number"
                        type="number"
                      />
                      <FormField
                        label="Description"
                        value={item.description}
                        onChange={(value) =>
                          onUpdateLineItem(
                            sectionIndex,
                            itemIndex,
                            'description',
                            value
                          )
                        }
                        placeholder="Item description"
                      />
                    </div>
                  </DataRow>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      label="Quantity Value"
                      value={item.quantity.value?.toString() || ''}
                      onChange={(value) =>
                        onUpdateLineItem(
                          sectionIndex,
                          itemIndex,
                          'quantity.value',
                          Number(value) || null
                        )
                      }
                      placeholder="Quantity value"
                      type="number"
                    />
                    <FormField
                      label="Quantity Unit"
                      value={item.quantity.unit || ''}
                      onChange={(value) =>
                        onUpdateLineItem(
                          sectionIndex,
                          itemIndex,
                          'quantity.unit',
                          value
                        )
                      }
                      placeholder="Unit (e.g., sq ft)"
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      label="Options Text"
                      value={item.options_text || ''}
                      onChange={(value) =>
                        onUpdateLineItem(
                          sectionIndex,
                          itemIndex,
                          'options_text',
                          value
                        )
                      }
                      placeholder="Additional options or notes"
                    />
                  </div>
                </div>
              ))}

              {section.line_items.length === 0 && (
                <EmptyState
                  title="No line items added yet"
                  description="Click 'Add Item' to get started"
                  actionLabel="Add Item"
                  onAction={() => onAddLineItem(sectionIndex)}
                />
              )}

              {section.line_items.length > 0 && (
                <AddButton
                  onClick={() => onAddLineItem(sectionIndex)}
                  size="sm"
                  variant="secondary"
                  dashed
                  className="w-full"
                >
                  Add Item
                </AddButton>
              )}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <EmptyState
            title="No sections added yet"
            description="Click 'Add Section' to get started with claim organization"
            actionLabel="Add Section"
            onAction={onAddSection}
          />
        )}

        {sections.length > 0 && (
          <AddButton onClick={onAddSection} size="sm" className="w-full">
            Add Section
          </AddButton>
        )}
      </div>
    </SectionCard>
  );
}
