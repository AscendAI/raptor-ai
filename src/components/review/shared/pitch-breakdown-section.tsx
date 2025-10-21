'use client';

import { SectionCard } from './section-card';
import { FormField } from './form-field';
import { DataRow } from './data-row';
import { AddButton } from './add-button';
import { EmptyState } from './empty-state';
import { Edit3 } from 'lucide-react';

interface PitchBreakdownItem {
  pitch: string;
  area_sqft: string;
  squares: string;
}

interface PitchBreakdownSectionProps {
  pitchBreakdown: PitchBreakdownItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: string) => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function PitchBreakdownSection({
  pitchBreakdown,
  onAdd,
  onRemove,
  onUpdate,
  title = 'Pitch Breakdown',
  description = 'Manage pitch breakdown data for different roof sections',
  variant = 'primary',
}: PitchBreakdownSectionProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={<Edit3 />}
      variant={variant}
    >
      <div className="space-y-4">
        {pitchBreakdown.length === 0 ? (
          <EmptyState
            title="No pitch breakdown entries"
            description="Add pitch breakdown entries to get started"
            actionLabel="Add First Entry"
            onAction={onAdd}
            variant={variant}
          />
        ) : (
          <>
            {pitchBreakdown.map((pitch, index) => (
              <DataRow
                key={index}
                onRemove={() => onRemove(index)}
                variant={variant}
              >
                <FormField
                  label="Pitch"
                  value={pitch.pitch}
                  onChange={(value) => onUpdate(index, 'pitch', value)}
                  placeholder="e.g., 6/12"
                  variant={variant}
                />
                <FormField
                  label="Area (sq ft)"
                  value={pitch.area_sqft}
                  onChange={(value) => onUpdate(index, 'area_sqft', value)}
                  placeholder="Area in sq ft"
                  variant={variant}
                />
                <FormField
                  label="Squares"
                  value={pitch.squares}
                  onChange={(value) => onUpdate(index, 'squares', value)}
                  placeholder="Squares"
                  variant={variant}
                />
              </DataRow>
            ))}
            <AddButton
              onClick={onAdd}
              variant={variant}
              fullWidth
              dashed
            >
              Add Pitch Breakdown
            </AddButton>
          </>
        )}
      </div>
    </SectionCard>
  );
}