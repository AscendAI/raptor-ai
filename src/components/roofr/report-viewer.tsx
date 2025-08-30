'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { RoofrReportJson } from '@/lib/roofr/types';

interface ReportDetailsSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ReportDetailsSection({
  title,
  children,
  defaultOpen = false,
}: ReportDetailsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-md overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left font-medium"
      >
        {title}
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

export interface RoofrReportViewerProps {
  data: RoofrReportJson;
  documentHash: string;
}

export function RoofrReportViewer({
  data,
  documentHash,
}: RoofrReportViewerProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Roof Report Analysis</h2>
        {data.address && (
          <p className="text-gray-700 mb-1">Address: {data.address}</p>
        )}
        {data.fileName && (
          <p className="text-gray-500 text-sm">File: {data.fileName}</p>
        )}
        {data.nearMapDate && (
          <p className="text-gray-500 text-sm">
            Nearmap Date: {data.nearMapDate}
          </p>
        )}
        <p className="text-gray-500 text-sm">
          Document ID: {documentHash.substring(0, 8)}...
        </p>
      </div>

      <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
        <h3 className="font-semibold text-green-800 mb-2">Recommended Waste</h3>
        <div className="flex flex-wrap gap-2">
          {data.recommendedWastePercents.map((percent) => (
            <span
              key={percent}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium"
            >
              {percent}%
            </span>
          ))}
        </div>
        <p className="text-sm text-green-700 mt-2">
          Method:{' '}
          {data.recommendationMethod === 'explicit'
            ? 'Explicitly specified in report'
            : 'Calculated using heuristics'}
        </p>
        {data.recommendationNotes && (
          <p className="text-xs text-green-600 mt-1">
            {data.recommendationNotes}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <ReportDetailsSection title="Area Totals" defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.areas.totalRoofAreaSqft && (
              <div>
                <p className="text-sm text-gray-500">Total Roof Area</p>
                <p className="font-medium">
                  {data.areas.totalRoofAreaSqft.toLocaleString()} sqft
                </p>
              </div>
            )}
            {data.areas.totalPitchedAreaSqft && (
              <div>
                <p className="text-sm text-gray-500">Pitched Area</p>
                <p className="font-medium">
                  {data.areas.totalPitchedAreaSqft.toLocaleString()} sqft
                </p>
              </div>
            )}
            {data.areas.totalFlatAreaSqft && (
              <div>
                <p className="text-sm text-gray-500">Flat Area</p>
                <p className="font-medium">
                  {data.areas.totalFlatAreaSqft.toLocaleString()} sqft
                </p>
              </div>
            )}
            {data.areas.totalRoofFacets !== undefined && (
              <div>
                <p className="text-sm text-gray-500">Roof Facets</p>
                <p className="font-medium">{data.areas.totalRoofFacets}</p>
              </div>
            )}
            {data.areas.predominantPitch && (
              <div>
                <p className="text-sm text-gray-500">Predominant Pitch</p>
                <p className="font-medium">{data.areas.predominantPitch}</p>
              </div>
            )}
          </div>
        </ReportDetailsSection>

        <ReportDetailsSection title="Linear Measurements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.linear).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-500">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <p className="font-medium">
                  {value.feet}ft {value.inches}in
                </p>
              </div>
            ))}
          </div>
        </ReportDetailsSection>

        <ReportDetailsSection title="Pitch Breakdown">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pitch
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area (sqft)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squares
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.pitchBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.pitch}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.areaSqft.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.squares.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportDetailsSection>

        <ReportDetailsSection title="Waste Recommendations">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waste %
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area (sqft)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squares
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.wasteRecommendations.length > 0 ? (
                  data.wasteRecommendations.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        data.recommendedWastePercents.includes(
                          item.wastePercent
                        )
                          ? 'bg-green-50'
                          : ''
                      }
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        {isNaN(item.wastePercent) ? '?' : item.wastePercent}%
                        {data.recommendedWastePercents.includes(
                          item.wastePercent
                        ) && (
                          <span className="ml-2 text-xs text-green-600">
                            (recommended)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {isNaN(item.areaSqft)
                          ? '-'
                          : item.areaSqft.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {isNaN(item.squares)
                          ? '-'
                          : item.squares.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      No waste recommendation data found in the report
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ReportDetailsSection>

        {data.materialCalculations.length > 0 && (
          <ReportDetailsSection title="Material Calculations">
            {data.materialCalculations.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4">
                <h4 className="font-medium mb-2">{section.section}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          10% Waste
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          15% Waste
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          17% Waste
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          20% Waste
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {section.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {row.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {row.unit}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {row.waste10 || '-'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {row.waste15 || '-'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {row.waste17 || '-'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {row.waste20 || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </ReportDetailsSection>
        )}

        <ReportDetailsSection title="Debug Information">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Sections Matched:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {data._debug?.matchedSections.map((section) => (
                  <span
                    key={section}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Waste Percentage Extraction:
              </p>
              <div className="mt-1 text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                <p>Method: {data.recommendationMethod}</p>
                <p>Notes: {data.recommendationNotes || 'None'}</p>
                <p>
                  Recommended:{' '}
                  {data.recommendedWastePercents.join(', ') || 'None'}
                </p>
                <p>
                  Raw waste %s:{' '}
                  {data.wasteRecommendations
                    .map((w) => w.wastePercent)
                    .join(', ') || 'None'}
                </p>
              </div>
            </div>
          </div>
        </ReportDetailsSection>
      </div>
    </Card>
  );
}
