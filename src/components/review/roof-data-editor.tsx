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
import { RoofReportData } from '@/lib/schemas/extraction';

interface RoofDataEditorProps {
  data: RoofReportData;
  onChange: (data: RoofReportData) => void;
}

export function RoofDataEditor({ data, onChange }: RoofDataEditorProps) {
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
    const updated = data.waste_table.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
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
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 rounded-t-xl pt-6">
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
                  className="text-sm font-medium text-slate-700 flex items-center"
                >
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  value={data.measurements[field.key] || ''}
                  onChange={(e) => updateMeasurement(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20 transition-colors"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pitch Breakdown */}
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200 rounded-t-xl pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                Pitch Breakdown
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Breakdown of roof areas by pitch angle and measurements
              </CardDescription>
            </div>
            <Button
              onClick={addPitchBreakdown}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pitch
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {data.pitch_breakdown.map((pitch, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    Pitch {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePitchBreakdown(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Pitch
                    </Label>
                    <Input
                      value={pitch.pitch}
                      onChange={(e) =>
                        updatePitchBreakdown(index, 'pitch', e.target.value)
                      }
                      placeholder="e.g., 6/12"
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Area (sq ft)
                    </Label>
                    <Input
                      value={pitch.area_sqft}
                      onChange={(e) =>
                        updatePitchBreakdown(index, 'area_sqft', e.target.value)
                      }
                      placeholder="Area in square feet"
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Squares
                    </Label>
                    <Input
                      value={pitch.squares}
                      onChange={(e) =>
                        updatePitchBreakdown(index, 'squares', e.target.value)
                      }
                      placeholder="Number of squares"
                      className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.pitch_breakdown.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <div className="p-3 bg-slate-200 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium mb-2">
                  No pitch breakdown added yet
                </p>
                <p className="text-slate-500 text-sm">
                  Click &ldquo;Add Pitch&rdquo; to get started with pitch
                  measurements
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Waste Table */}
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200 rounded-t-xl pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <Edit3 className="h-5 w-5 text-emerald-600" />
                </div>
                Waste Table
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Materials and waste calculations for accurate estimates
              </CardDescription>
            </div>
            <Button
              onClick={addWasteTableRow}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {data.waste_table.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 border-emerald-200"
                  >
                    Item {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWasteTableRow(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Waste Percent
                    </Label>
                    <Input
                      value={item.waste_percent}
                      onChange={(e) =>
                        updateWasteTable(index, 'waste_percent', e.target.value)
                      }
                      placeholder="Waste percentage"
                      className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Area (sq ft)
                    </Label>
                    <Input
                      value={item.area_sqft}
                      onChange={(e) =>
                        updateWasteTable(index, 'area_sqft', e.target.value)
                      }
                      placeholder="Area in square feet"
                      className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Squares
                    </Label>
                    <Input
                      value={item.squares}
                      onChange={(e) =>
                        updateWasteTable(index, 'squares', e.target.value)
                      }
                      placeholder="Number of squares"
                      className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Recommended
                    </Label>
                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        type="checkbox"
                        checked={item.recommended}
                        onChange={(e) =>
                          updateWasteTable(
                            index,
                            'recommended',
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-2"
                      />
                      <span className="text-sm text-slate-600">
                        Recommended option
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.waste_table.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                <div className="p-3 bg-slate-200 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium mb-2">
                  No waste table items added yet
                </p>
                <p className="text-slate-500 text-sm">
                  Click &ldquo;Add Item&rdquo; to get started with waste
                  calculations
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
