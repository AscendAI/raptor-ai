'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      squares: ''
    };
    onChange({
      ...data,
      pitch_breakdown: [...data.pitch_breakdown, newPitch]
    });
  };

  const removePitchBreakdown = (index: number) => {
    onChange({
      ...data,
      pitch_breakdown: data.pitch_breakdown.filter((_, i) => i !== index)
    });
  };

  const updatePitchBreakdown = (index: number, field: string, value: string) => {
    const updated = data.pitch_breakdown.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange({
      ...data,
      pitch_breakdown: updated
    });
  };

  const addWasteTableRow = () => {
    const newRow = {
      waste_percent: '',
      area_sqft: '',
      squares: '',
      recommended: false
    };
    onChange({
      ...data,
      waste_table: [...data.waste_table, newRow]
    });
  };

  const removeWasteTableRow = (index: number) => {
    onChange({
      ...data,
      waste_table: data.waste_table.filter((_, i) => i !== index)
    });
  };

  const updateWasteTable = (index: number, field: string, value: string | boolean) => {
    const updated = data.waste_table.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange({
      ...data,
      waste_table: updated
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
    { key: 'eaves_rakes', label: 'Eaves & Rakes' }
  ];

  return (
    <div className="space-y-6">
      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Roof Measurements
          </CardTitle>
          <CardDescription>
            Review and edit the roof measurement data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {measurementFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  value={data.measurements[field.key] || ''}
                  onChange={(e) => updateMeasurement(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pitch Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pitch Breakdown</CardTitle>
              <CardDescription>
                Breakdown of roof areas by pitch
              </CardDescription>
            </div>
            <Button onClick={addPitchBreakdown} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Pitch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.pitch_breakdown.map((pitch, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">Pitch {index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePitchBreakdown(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pitch</Label>
                    <Input
                      value={pitch.pitch}
                      onChange={(e) => updatePitchBreakdown(index, 'pitch', e.target.value)}
                      placeholder="e.g., 6/12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Area (sq ft)</Label>
                    <Input
                      value={pitch.area_sqft}
                      onChange={(e) => updatePitchBreakdown(index, 'area_sqft', e.target.value)}
                      placeholder="Area in square feet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Squares</Label>
                    <Input
                      value={pitch.squares}
                      onChange={(e) => updatePitchBreakdown(index, 'squares', e.target.value)}
                      placeholder="Number of squares"
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.pitch_breakdown.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pitch breakdown added yet. Click Add Pitch to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Waste Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Waste Table</CardTitle>
              <CardDescription>
                Materials and waste calculations
              </CardDescription>
            </div>
            <Button onClick={addWasteTableRow} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.waste_table.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">Item {index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWasteTableRow(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Waste Percent</Label>
                    <Input
                      value={item.waste_percent}
                      onChange={(e) => updateWasteTable(index, 'waste_percent', e.target.value)}
                      placeholder="Waste percentage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Area (sq ft)</Label>
                    <Input
                      value={item.area_sqft}
                      onChange={(e) => updateWasteTable(index, 'area_sqft', e.target.value)}
                      placeholder="Area in square feet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Squares</Label>
                    <Input
                      value={item.squares}
                      onChange={(e) => updateWasteTable(index, 'squares', e.target.value)}
                      placeholder="Number of squares"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recommended</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.recommended}
                        onChange={(e) => updateWasteTable(index, 'recommended', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Recommended</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.waste_table.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No waste table items added yet. Click Add Item to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}