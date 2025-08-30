import type {
  RoofrReportJson,
  FeetInches,
  LinearMeasurements,
  AreaTotals,
  PitchBreakdown,
  WasteRecommendations,
  MaterialCalcSection,
  MaterialCalcRow,
} from './types';

const toNumber = (s?: string | null) =>
  s ? Number(s.replace(/[^0-9.\-]/g, '')) : NaN;

export function parseFeetInches(raw: string): FeetInches | undefined {
  const m = raw.match(/(\d+)\s*ft\s*(\d+)\s*in/i);
  if (!m) return;
  return { feet: Number(m[1]), inches: Number(m[2]), raw: m[0] };
}

function matchAfter(
  text: string,
  label: string,
  pattern: RegExp
): RegExpMatchArray | null {
  const idx = text.indexOf(label);
  if (idx === -1) return null;
  const tail = text.slice(idx);
  return tail.match(pattern);
}

function extractAddress(text: string): string | undefined {
  const addr = text.match(/\n([0-9]{1,6}[^,\n]+\,[^\n]+[A-Z]{2}\s*\d{5})/);
  return addr ? addr[1].trim() : undefined;
}

function extractNearmap(text: string): string | undefined {
  const n = text.match(/Nearmap\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
  return n ? n[1] : undefined;
}

function extractLinearMeasurements(text: string): LinearMeasurements {
  const names: Record<string, keyof LinearMeasurements> = {
    Eaves: 'eaves',
    Valleys: 'valleys',
    Hips: 'hips',
    Ridges: 'ridges',
    Rakes: 'rakes',
    'Wall flashing': 'wallFlashing',
    'Step flashing': 'stepFlashing',
    Transitions: 'transitions',
    'Parapet wall': 'parapetWall',
    Unspecified: 'unspecified',
  };

  const out: LinearMeasurements = {};
  const re = new RegExp(
    '(Eaves|Valleys|Hips|Ridges|Rakes|Wall flashing|Step flashing|Transitions|Parapet wall|Unspecified)\\s*:\\s*(\\d+ft\\s*\\d+in)',
    'gi'
  );

  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const key = names[m[1]];
    const len = parseFeetInches(m[2]);
    if (key && len) out[key] = len;
  }
  return out;
}

function extractAreaTotals(text: string): AreaTotals {
  const findNum = (label: string) => {
    const m = matchAfter(
      text,
      label,
      new RegExp(label + '\\s+(\\d+[\\d,\\.]*)\\s*sqft', 'i')
    );
    return m ? toNumber(m[1]) : undefined;
  };

  const totals: AreaTotals = {
    totalRoofAreaSqft: findNum('Total roof area'),
    totalPitchedAreaSqft: findNum('Total pitched area'),
    totalFlatAreaSqft: findNum('Total flat area'),
  };

  const facets = matchAfter(
    text,
    'Total roof facets',
    /Total roof facets\s+(\d+)\s+facets/i
  );
  if (facets) totals.totalRoofFacets = Number(facets[1]);

  const pitch = matchAfter(
    text,
    'Predominant pitch',
    /Predominant pitch\s+([0-9/]+)/i
  );
  if (pitch) totals.predominantPitch = pitch[1];

  return totals;
}

function extractPitchBreakdown(text: string): PitchBreakdown {
  const header = text.match(
    /Pitch\s+([0-9/ \t]+)\n+Area\s*\(sqft\)\s+([0-9 \t,\.]+)\n+Squares\s+([0-9 \t,\.]+)/i
  );
  if (!header) return [];
  const pitches = header[1].trim().split(/\s+/);
  const areas = header[2]
    .trim()
    .split(/\s+/)
    .map((v) => toNumber(v));
  const squares = header[3]
    .trim()
    .split(/\s+/)
    .map((v) => toNumber(v));
  const out: PitchBreakdown = [];
  for (let i = 0; i < pitches.length; i++) {
    if (!pitches[i]) continue;
    out.push({
      pitch: pitches[i],
      areaSqft: Number(areas[i] ?? 0),
      squares: Number(squares[i] ?? 0),
    });
  }
  return out;
}

function extractWasteRecommendations(text: string): WasteRecommendations {
  // First try to match a table-like structure
  const m = text.match(
    /Waste\s*%\s*([0-9%\s\t]+)\n+Area\s*\(sqft\)\s*([0-9,\s\t\.]+)\n+Squares\s*([0-9\s\t\.]+)/i
  );
  if (!m) return [];

  // Clean and parse the percentage values
  const percStr = m[1].trim();
  // Extract individual percentages with regex to ensure we get clean values
  const percMatches = [...percStr.matchAll(/(\d+)%/g)];
  const perc = percMatches.map((match) => Number(match[1]));

  const areas = m[2]
    .trim()
    .split(/\s+/)
    .map((v) => toNumber(v));
  const squares = m[3]
    .trim()
    .split(/\s+/)
    .map((v) => toNumber(v));

  // Ensure all arrays have same length by padding if necessary
  const maxLength = Math.max(perc.length, areas.length, squares.length);

  const out = [];
  for (let i = 0; i < maxLength; i++) {
    if (i < perc.length) {
      out.push({
        wastePercent: perc[i],
        areaSqft: i < areas.length ? Number(areas[i]) : 0,
        squares: i < squares.length ? Number(squares[i]) : 0,
      });
    }
  }
  return out;
}

function normalizeUnitCell(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function sectionNameFromHeader(line: string): string {
  const m = line.match(/^([A-Za-z ]+)\s*\(/);
  return m ? m[1].trim() : line.trim();
}

function inferUnitFromHeader(line: string): string {
  const m = line.match(/\(([^)]+)\)/);
  if (!m) return 'unit';
  const within = m[1].toLowerCase();
  if (within.includes('sqft')) return 'sqft';
  if (within.includes('ft')) return 'ft';
  return within;
}

function inferUnitFromRowName(name: string): string {
  if (/bundle/i.test(name)) return 'bundle';
  if (/roll/i.test(name)) return 'roll';
  if (/sheet/i.test(name)) return 'sheet';
  if (/ft\b/i.test(name)) return 'ft';
  if (/sqft/i.test(name)) return 'sqft';
  return 'unit';
}

function extractMaterialCalculations(text: string): MaterialCalcSection[] {
  const start = text.indexOf('Material calculations');
  if (start === -1) return [];
  const end = text.indexOf('This report was prepared', start + 10);
  const block = text.slice(start, end === -1 ? undefined : end);

  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: MaterialCalcSection[] = [];
  let current: MaterialCalcSection | null = null;

  const pushRow = (
    name: string,
    unitHint?: string,
    w10?: string,
    w15?: string,
    w17?: string,
    w20?: string
  ) => {
    const row: MaterialCalcRow = {
      name: name.trim(),
      unit: unitHint || inferUnitFromRowName(name),
      waste10: w10 ? normalizeUnitCell(w10) : undefined,
      waste15: w15 ? normalizeUnitCell(w15) : undefined,
      waste17: w17 ? normalizeUnitCell(w17) : undefined,
      waste20: w20 ? normalizeUnitCell(w20) : undefined,
    };
    current?.rows.push(row);
  };

  const headerRegex = /^Product\s+Unit\s+Waste/i;

  for (const line of lines) {
    if (/^Material calculations/i.test(line)) continue;
    if (headerRegex.test(line)) continue;

    const secMatch = line.match(
      /^([A-Za-z ]+\([^)]+\)|[A-Za-z ]+)\s+([\d,\.]+\s*\w+)\s+([\d,\.]+\s*\w+)\s+([\d,\.]+\s*\w+)\s+([\d,\.]+\s*\w+)$/
    );
    if (secMatch) {
      const header = secMatch[1];
      const section = sectionNameFromHeader(header);
      current = { section, rows: [] };
      sections.push(current);

      const unitHint = inferUnitFromHeader(header);
      pushRow(
        header,
        unitHint,
        secMatch[2],
        secMatch[3],
        secMatch[4],
        secMatch[5]
      );
      continue;
    }

    const brandRow = line.match(
      /^(.+?)\s+(bundle|roll|sheet|sqft|ft)\s+([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)$/i
    );
    if (brandRow) {
      const [, name, unit, w10, w15, w17, w20] = brandRow;
      pushRow(name, unit, w10, w15, w17, w20);
      continue;
    }
  }

  return sections;
}

/** ——— Recommendation helpers ——— */

function feetInchesToFeet(f?: FeetInches) {
  if (!f) return 0;
  return f.feet + (f.inches || 0) / 12;
}

function nearestAvailable(target: number, options: number[]) {
  if (!options.length) return [];
  let best = options[0];
  let bestDiff = Math.abs(options[0] - target);
  for (const o of options.slice(1)) {
    const d = Math.abs(o - target);
    if (d < bestDiff) {
      best = o;
      bestDiff = d;
    }
  }
  return [best];
}

function extractExplicitRecommended(text: string): number[] {
  const hits = new Set<number>();

  // Look for "Recommended" header or label
  const re1 = /Recommended\s*[:\-]?\s*(\d{1,2})\s*%/gi;
  // Look for percentage marked as "recommended" in parentheses
  const re2 = /(\d{1,2})\s*%\s*\(recommended\)/gi;
  // Look for highlighted or emphasized percentage in the waste table
  const re3 = /(\d{1,2})\s*%.*?Recommended/gi;
  // Look for row with "recommended" in it - without 's' flag
  const re4 = /Waste\s*%.*?(\d{1,2})%.*?\(recommended\)/i;

  let m: RegExpExecArray | null;
  while ((m = re1.exec(text))) hits.add(Number(m[1]));
  while ((m = re2.exec(text))) hits.add(Number(m[1]));
  while ((m = re3.exec(text))) hits.add(Number(m[1]));

  // Check for the row match
  const rowMatch = text.match(re4);
  if (rowMatch) hits.add(Number(rowMatch[1]));

  return [...hits].sort((a, b) => a - b);
}

function recommendWasteHeuristic(
  linear: LinearMeasurements,
  areas: AreaTotals,
  pitchBreakdown: PitchBreakdown,
  availablePercents: number[]
): { recs: number[]; notes: string } {
  let score = 0;
  const valleysFt = feetInchesToFeet(linear.valleys);
  if (valleysFt > 50) score += 1;
  if (valleysFt > 100) score += 1;

  const hipsFt = feetInchesToFeet(linear.hips);
  const ridgesFt = feetInchesToFeet(linear.ridges);
  if (hipsFt + ridgesFt > 120) score += 1;

  const facets = areas.totalRoofFacets || 0;
  if (facets >= 6) score += 1;
  if (facets >= 9) score += 1;

  const uniquePitches = new Set(pitchBreakdown.map((p) => p.pitch)).size;
  if (uniquePitches >= 3) score += 1;

  const pred = areas.predominantPitch;
  const predNum = pred ? Number(pred.split('/')[0] || '0') : 0;
  if (predNum >= 9) score += 1;

  const target =
    score <= 1
      ? 10
      : score === 2
        ? 12
        : score === 3
          ? 15
          : score === 4
            ? 17
            : score === 5
              ? 20
              : 22;

  const recs = nearestAvailable(target, availablePercents);
  const notes =
    `Heuristic: score=${score} (valleys ${valleysFt.toFixed(1)}ft, hips+ridges ${(hipsFt + ridgesFt).toFixed(1)}ft, ` +
    `facets ${facets}, pitchVar ${uniquePitches}, predominant ${pred || 'n/a'}) → target ${target}%.`;

  return { recs, notes };
}

/** ——— Main parser ——— */
export function parseRoofrPdf(
  fullText: string,
  fileName?: string,
  pageCount?: number
): RoofrReportJson {
  const address = extractAddress(fullText);
  const nearMapDate = extractNearmap(fullText);
  const linear = extractLinearMeasurements(fullText);
  const areas = extractAreaTotals(fullText);
  const pitchBreakdown = extractPitchBreakdown(fullText);
  const wasteRecommendations = extractWasteRecommendations(fullText);

  const availablePercents = wasteRecommendations
    .map((w) => w.wastePercent)
    .filter((n) => !Number.isNaN(n));
  let recommendedWastePercents: number[] = [];
  let recommendationMethod: 'explicit' | 'heuristic' = 'heuristic';
  let recommendationNotes: string | undefined;

  const explicit = extractExplicitRecommended(fullText).filter((p) =>
    availablePercents.includes(p)
  );
  if (explicit.length) {
    recommendedWastePercents = explicit;
    recommendationMethod = 'explicit';
    recommendationNotes = 'Detected explicit recommendation in PDF text.';
  } else {
    const h = recommendWasteHeuristic(
      linear,
      areas,
      pitchBreakdown,
      availablePercents
    );
    recommendedWastePercents = h.recs;
    recommendationNotes = h.notes;
  }

  const materialCalculations = extractMaterialCalculations(fullText);

  const matchedSections = [
    address ? 'address' : '',
    nearMapDate ? 'nearmap' : '',
    Object.keys(linear).length ? 'linear' : '',
    areas.totalRoofAreaSqft ? 'areas' : '',
    pitchBreakdown.length ? 'pitch' : '',
    wasteRecommendations.length ? 'waste' : '',
    recommendedWastePercents.length ? 'recommendedWaste' : '',
    materialCalculations.length ? 'materials' : '',
  ].filter(Boolean);

  return {
    fileName,
    pageCount,
    address,
    nearMapDate,
    linear,
    areas,
    pitchBreakdown,
    wasteRecommendations,
    recommendedWastePercents,
    recommendationMethod,
    recommendationNotes,
    materialCalculations,
    _debug: { matchedSections },
  };
}
