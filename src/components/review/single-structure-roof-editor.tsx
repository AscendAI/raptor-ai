'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { SingleRoofReportData } from '@/lib/types/extraction';

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
      {/* Measurements */}
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-300 border-b border-slate-200 rounded-t-xl pt-6">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-slate-200 rounded-lg">
              <Edit3 className="h-5 w-5 text-slate-600" />
            </div>
            Roof Measurements
          </CardTitle>
          <CardDescription className="text-slate-600">
            Review and edit the roof measurement data with precision
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {measurementFields.map((field) => (
              <div key={field.key} className="space-y-3">
                <Label
                  htmlFor={field.key}
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  type="text"
                  value={data.measurements[field.key] || ''}
                  onChange={(e) => updateMeasurement(field.key, e.target.value)}
                  className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pitch Breakdown */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit3 className="h-5 w-5 text-blue-600" />
            </div>
            Pitch Breakdown
          </CardTitle>
          <CardDescription className="text-slate-600">
            Manage pitch breakdown data for different roof sections
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {data.pitch_breakdown.map((pitch, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Pitch
                  </Label>
                  <Input
                    type="text"
                    value={pitch.pitch}
                    onChange={(e) =>
                      updatePitchBreakdown(index, 'pitch', e.target.value)
                    }
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 6/12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Area (sq ft)
                  </Label>
                  <Input
                    type="text"
                    value={pitch.area_sqft}
                    onChange={(e) =>
                      updatePitchBreakdown(index, 'area_sqft', e.target.value)
                    }
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Area in sq ft"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Squares
                  </Label>
                  <Input
                    type="text"
                    value={pitch.squares}
                    onChange={(e) =>
                      updatePitchBreakdown(index, 'squares', e.target.value)
                    }
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Squares"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePitchBreakdown(index)}
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPitchBreakdown}
              className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pitch Breakdown
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Waste Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <Edit3 className="h-5 w-5 text-green-600" />
            </div>
            Waste Table
          </CardTitle>
          <CardDescription className="text-slate-600">
            Configure waste percentages and corresponding areas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {data.waste_table.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Waste %
                  </Label>
                  <Input
                    type="text"
                    value={row.waste_percent}
                    onChange={(e) =>
                      updateWasteTable(index, 'waste_percent', e.target.value)
                    }
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="e.g., 10%"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Area (sq ft)
                  </Label>
                  <Input
                    type="text"
                    value={row.area_sqft}
                    onChange={(e) =>
                      updateWasteTable(index, 'area_sqft', e.target.value)
                    }
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Area in sq ft"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Squares
                  </Label>
                  <Input
                    type="text"
                    value={row.squares}
                    onChange={(e) =>
                      updateWasteTable(index, 'squares', e.target.value)
                    }
                    className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Squares"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Recommended
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      checked={row.recommended}
                      onChange={(e) =>
                        updateWasteTable(index, 'recommended', e.target.checked)
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
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeWasteTableRow(index)}
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addWasteTableRow}
              className="w-full border-dashed border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Waste Table Row
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}