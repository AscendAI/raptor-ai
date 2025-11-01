'use client';

import { SectionCard } from './section-card';
import { FormField } from './form-field';
import { Edit3 } from 'lucide-react';

interface MeasurementField {
  key: string;
  label: string;
}

interface MeasurementsSectionProps {
  measurements: Record<string, string | null | undefined>;
  onUpdate: (field: string, value: string) => void;
  fields: MeasurementField[];
  title?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function MeasurementsSection({
  measurements,
  onUpdate,
  fields,
  title = 'Measurements',
  description = 'Review and edit measurement data with precision',
  variant = 'secondary',
}: MeasurementsSectionProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={<Edit3 />}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {fields.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            value={measurements[field.key] || ''}
            onChange={(value) => onUpdate(field.key, value)}
            variant={variant}
          />
        ))}
      </div>
    </SectionCard>
  );
}