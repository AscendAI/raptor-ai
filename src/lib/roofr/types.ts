export type FeetInches = { feet: number; inches: number; raw: string };

export type LinearMeasurements = {
  eaves?: FeetInches;
  valleys?: FeetInches;
  hips?: FeetInches;
  ridges?: FeetInches;
  rakes?: FeetInches;
  wallFlashing?: FeetInches;
  stepFlashing?: FeetInches;
  transitions?: FeetInches;
  parapetWall?: FeetInches;
  unspecified?: FeetInches;
};

export type AreaTotals = {
  totalRoofAreaSqft?: number;
  totalPitchedAreaSqft?: number;
  totalFlatAreaSqft?: number;
  totalRoofFacets?: number;
  predominantPitch?: string; // e.g., "7/12"
};

export type PitchBreakdown = {
  pitch: string;
  areaSqft: number;
  squares: number;
}[];

export type WasteRecommendationRow = {
  wastePercent: number;
  areaSqft: number;
  squares: number;
};

export type WasteRecommendations = WasteRecommendationRow[];

export type MaterialCalcRow = {
  name: string;
  unit: string; // "sqft" | "bundle" | "roll" | "ft" | "sheet" | "unit"
  waste10?: string;
  waste15?: string;
  waste17?: string;
  waste20?: string;
};

export type MaterialCalcSection = {
  section: string; // "Shingle", "Starter", "Ice and Water", ...
  rows: MaterialCalcRow[];
};

export interface RoofrReportJson {
  fileName?: string;
  address?: string;
  nearMapDate?: string;
  pageCount?: number;

  linear: LinearMeasurements;
  areas: AreaTotals;
  pitchBreakdown: PitchBreakdown;

  wasteRecommendations: WasteRecommendations;

  /** Which waste % is recommended (explicitly or by heuristic) */
  recommendedWastePercents: number[];
  recommendationMethod: 'explicit' | 'heuristic';
  recommendationNotes?: string;

  materialCalculations: MaterialCalcSection[];

  _debug?: {
    matchedSections: string[];
  };
}
