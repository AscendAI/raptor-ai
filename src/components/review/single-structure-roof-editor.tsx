'use client';

import { SingleRoofReportData } from '@/lib/types/extraction';
import {
  MeasurementsSection,
  PitchBreakdownSection,
  WasteTableSection,
} from './shared';

interface SingleStructureRoofEditorProps {
  data: SingleRoofReportData;
  onChange: (data: SingleRoofReportData) => void;
}

export function SingleStructureRoofEditor({ data, onChange }: SingleStructureRoofEditorProps) {
  const updateMeasurement = (field: string, value: string) => {
    const updatedMeasurements = { ...data.measurements, [field]: value };
    onChange({ ...data, measurements: updatedMeasurements });
  };

  const addPitchBreakdown = () => {
    const newPitch = {
      pitch: '',
      area_sqft: '',
      squares: '',
    };
    onChange({
      ...data,
      pitch_breakdown: [...data.pitch_breakdown, newPitch],
    });
  };

  const removePitchBreakdown = (index: number) => {
    onChange({
      ...data,
      pitch_breakdown: data.pitch_breakdown.filter((_, i) => i !== index),
    });
  };

  const updatePitchBreakdown = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = data.pitch_breakdown.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({
      ...data,
      pitch_breakdown: updated,
    });
  };

  const addWasteTableRow = () => {
    const newRow = {
      waste_percent: '',
      area_sqft: '',
      squares: '',
      recommended: false,
    };
    onChange({
      ...data,
      waste_table: [...data.waste_table, newRow],
    });
  };

  const removeWasteTableRow = (index: number) => {
    onChange({
      ...data,
      waste_table: data.waste_table.filter((_, i) => i !== index),
    });
  };

  const updateWasteTable = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    let updated;

    // If updating the 'recommended' field and setting it to true,
    // ensure all other items have recommended set to false
    if (field === 'recommended' && value === true) {
      updated = data.waste_table.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        } else {
          return { ...item, recommended: false };
        }
      });
    } else {
      updated = data.waste_table.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
    }

    onChange({
      ...data,
      waste_table: updated,
    });
  };

  const measurementFields = [
    { key: 'total_roof_area', label: 'Total Roof Area' },
    { key: 'total_pitched_area', label: 'Total Pitched Area' },
    { key: 'total_flat_area', label: 'Total Flat Area' },
    { key: 'total_roof_facets', label: 'Total Roof Facets' },
    { key: 'predominant_pitch', label: 'Predominant Pitch' },
    { key: 'total_eaves', label: 'Total Eaves' },
    { key: 'total_valleys', label: 'Total Valleys' },
    { key: 'total_hips', label: 'Total Hips' },
    { key: 'total_ridges', label: 'Total Ridges' },
    { key: 'total_rakes', label: 'Total Rakes' },
    { key: 'total_wall_flashing', label: 'Total Wall Flashing' },
    { key: 'total_step_flashing', label: 'Total Step Flashing' },
    { key: 'total_transitions', label: 'Total Transitions' },
    { key: 'total_parapet_wall', label: 'Total Parapet Wall' },
    { key: 'total_unspecified', label: 'Total Unspecified' },
    { key: 'hips_ridges', label: 'Hips & Ridges' },
    { key: 'eaves_rakes', label: 'Eaves & Rakes' },
  ];

  return (
    <div className="space-y-8">
      <MeasurementsSection
        measurements={data.measurements}
        onUpdate={updateMeasurement}
        fields={measurementFields}
        title="Roof Measurements"
        description="Review and edit the roof measurement data with precision"
        variant="secondary"
      />

      <PitchBreakdownSection
        pitchBreakdown={data.pitch_breakdown}
        onAdd={addPitchBreakdown}
        onRemove={removePitchBreakdown}
        onUpdate={updatePitchBreakdown}
        variant="primary"
      />

      <WasteTableSection
        wasteTable={data.waste_table}
        onAdd={addWasteTableRow}
        onRemove={removeWasteTableRow}
        onUpdate={updateWasteTable}
        variant="success"
      />
    </div>
  );
}