'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit3 } from 'lucide-react';
import { RoofReportData, SingleRoofReportData } from '@/lib/types/extraction';
import { SingleStructureRoofEditor } from './single-structure-roof-editor';

interface MultiStructureRoofEditorProps {
  data: RoofReportData;
  onChange: (data: RoofReportData) => void;
}

export function MultiStructureRoofEditor({ data, onChange }: MultiStructureRoofEditorProps) {
  const [activeTab, setActiveTab] = useState('structure-1');

  // Handle single structure case (backward compatibility)
  if (data.structureCount === 1) {
    const singleStructureData: SingleRoofReportData = {
      measurements: data.structures[0]?.measurements || {},
      pitch_breakdown: data.structures[0]?.pitch_breakdown || [],
      waste_table: data.structures[0]?.waste_table || [],
    };

    const handleSingleStructureChange = (updatedData: SingleRoofReportData) => {
      const updatedMultiData: RoofReportData = {
        structureCount: 1,
        structures: [{
          structureNumber: 1,
          measurements: updatedData.measurements,
          pitch_breakdown: updatedData.pitch_breakdown,
          waste_table: updatedData.waste_table,
        }],
      };
      onChange(updatedMultiData);
    };

    return (
      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              Single Structure Review
            </CardTitle>
            <CardDescription className="text-slate-600">
              Review and edit the roof data for your single structure
            </CardDescription>
          </CardHeader>
        </Card>
        <SingleStructureRoofEditor data={singleStructureData} onChange={handleSingleStructureChange} />
      </div>
    );
  }

  // Handle multiple structures case
  const handleStructureChange = (structureIndex: number, updatedStructureData: SingleRoofReportData) => {
    const updatedStructures = data.structures.map((structure, index) => {
      if (index === structureIndex) {
        return {
          structureNumber: structure.structureNumber,
          measurements: updatedStructureData.measurements,
          pitch_breakdown: updatedStructureData.pitch_breakdown,
          waste_table: updatedStructureData.waste_table,
        };
      }
      return structure;
    });

    onChange({
      ...data,
      structures: updatedStructures,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${data.structures.length}, 1fr)` }}>
          {data.structures.map((structure, index) => (
            <TabsTrigger
              key={`structure-${structure.structureNumber}`}
              value={`structure-${structure.structureNumber}`}
              className="text-sm"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Structure {structure.structureNumber}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.structures.map((structure, index) => {
          const singleStructureData: SingleRoofReportData = {
            measurements: structure.measurements,
            pitch_breakdown: structure.pitch_breakdown,
            waste_table: structure.waste_table,
          };

          return (
            <TabsContent
              key={`structure-${structure.structureNumber}`}
              value={`structure-${structure.structureNumber}`}
              className="mt-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Edit3 className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Structure {structure.structureNumber} Details
                  </h3>
                </div>
                <SingleStructureRoofEditor
                  data={singleStructureData}
                  onChange={(updatedData: SingleRoofReportData) => handleStructureChange(index, updatedData)}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}