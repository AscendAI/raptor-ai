'use client';

import { SectionCard } from './section-card';
import { FormField } from './form-field';
import { DataRow } from './data-row';
import { AddButton } from './add-button';
import { EmptyState } from './empty-state';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';

interface WasteTableItem {
  waste_percent: string;
  area_sqft: string;
  squares: string;
  recommended: boolean;
}

interface WasteTableSectionProps {
  wasteTable: WasteTableItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string | boolean) => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function WasteTableSection({
  wasteTable,
  onAdd,
  onRemove,
  onUpdate,
  title = 'Waste Table',
  description = 'Configure waste percentages and corresponding areas',
  variant = 'success',
}: WasteTableSectionProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={<Edit3 />}
      variant={variant}
    >
      <div className="space-y-4">
        {wasteTable.length === 0 ? (
          <EmptyState
            title="No waste table entries"
            description="Add waste table entries to get started"
            actionLabel="Add First Entry"
            onAction={onAdd}
            variant={variant}
          />
        ) : (
          <>
            {wasteTable.map((row, index) => (
              <DataRow
                key={index}
                onRemove={() => onRemove(index)}
                variant={variant}
                className="grid-cols-1 md:grid-cols-5"
              >
                <FormField
                  label="Waste %"
                  value={row.waste_percent}
                  onChange={(value) => onUpdate(index, 'waste_percent', value)}
                  placeholder="e.g., 10%"
                  variant={variant}
                />
                <FormField
                  label="Area (sq ft)"
                  value={row.area_sqft}
                  onChange={(value) => onUpdate(index, 'area_sqft', value)}
                  placeholder="Area in sq ft"
                  variant={variant}
                />
                <FormField
                  label="Squares"
                  value={row.squares}
                  onChange={(value) => onUpdate(index, 'squares', value)}
                  placeholder="Squares"
                  variant={variant}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Recommended
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      checked={row.recommended}
                      onChange={(e) =>
                        onUpdate(index, 'recommended', e.target.checked)
                      }
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    {row.recommended && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </DataRow>
            ))}
            <AddButton
              onClick={onAdd}
              variant={variant}
              fullWidth
              dashed
            >
              Add Waste Table Row
            </AddButton>
          </>
        )}
      </div>
    </SectionCard>
  );
}