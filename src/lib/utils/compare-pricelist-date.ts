// Utilities to compare insurance price list month vs insurance date (month)

const MONTHS: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

export type PriceListDateStatus = {
  status: 'pass' | 'failed' | 'warning';
  message: string;
};

export function parsePriceListDate(priceList?: string | null): Date | null {
  if (!priceList) return null;
  const m = priceList.match(/_([A-Z]{3})(\d{2})\b/);
  if (!m) return null;
  const [, monStr, yy] = m;
  const month = MONTHS[monStr as keyof typeof MONTHS];
  if (month == null) return null;
  const year = 2000 + parseInt(yy, 10);
  return new Date(Date.UTC(year, month, 1));
}

export function parseDateLoose(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? null : new Date(t);
}

function monthsDiff(a: Date, b: Date): number {
  const am = a.getUTCFullYear() * 12 + a.getUTCMonth();
  const bm = b.getUTCFullYear() * 12 + b.getUTCMonth();
  return am - bm;
}

/**
 * Compare price list month/year vs the insurance date month/year with ±5 months tolerance.
 * - pass: |diffMonths| <= 5
 * - failed: |diffMonths| > 5
 * - warning: if either date is missing/unparseable
 */
export function evaluatePriceListVsInsuranceDate(
  priceList: string | null | undefined,
  insuranceDate: string | null | undefined
): PriceListDateStatus {
  const plDate = parsePriceListDate(priceList ?? null);
  const insDate = parseDateLoose(insuranceDate ?? null);
  if (!plDate || !insDate) {
    return {
      status: 'warning',
      message:
        'Could not determine a reliable date comparison (missing price list or insurance date)',
    };
  }
  const signed = monthsDiff(insDate, plDate); // positive => price list older than insurance date
  const diff = Math.abs(signed);
  if (diff <= 5) {
    return { status: 'pass', message: 'Price list looks recent' };
  }
  if (signed > 5) {
    return { status: 'failed', message: 'Price list date is too old' };
  }
  return { status: 'failed', message: 'Price list date is too recent' };
}
