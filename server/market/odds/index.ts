/**
 * Conversion functions for betting odds formats: Decimal, Fractional, American, and Implied Probability.
 */

export interface OddsValue {
  decimal: number;
  fractional: string;
  american: number;
  impliedProbability: number;
}

/**
 * Converts Decimal odds to American odds.
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal <= 1.0) return 0;
  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Converts American odds to Decimal odds.
 */
export function americanToDecimal(american: number): number {
  if (american === 0) return 1.0;
  if (american > 0) {
    return 1 + american / 100;
  } else {
    return 1 - 100 / american;
  }
}

/**
 * Helper to calculate greatest common divisor for fractional odds conversion.
 */
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/**
 * Converts Decimal odds to Fractional odds string (e.g. "5/2").
 */
export function decimalToFractional(decimal: number): string {
  if (decimal <= 1.0) return "0/1";
  const tolerance = 1.0e-9;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = decimal - 1;
  let x = b;
  do {
    const a = Math.floor(x);
    let aux = h1; h1 = a * h1 + h2; h2 = aux;
    aux = k1; k1 = a * k1 + k2; k2 = aux;
    x = 1 / (x - a);
  } while (Math.abs(b - h1 / k1) > b * tolerance);

  // Simplify
  const divisor = gcd(h1, k1);
  const num = Math.round(h1 / divisor);
  const den = Math.round(k1 / divisor);
  return `${num}/${den}`;
}

/**
 * Converts Fractional odds string to Decimal odds.
 */
export function fractionalToDecimal(fractional: string): number {
  const parts = fractional.split("/");
  if (parts.length !== 2) return 1.0;
  const num = parseFloat(parts[0]);
  const den = parseFloat(parts[1]);
  if (isNaN(num) || isNaN(den) || den === 0) return 1.0;
  return 1.0 + num / den;
}

/**
 * Converts Decimal odds to raw implied probability.
 */
export function decimalToImpliedProbability(decimal: number): number {
  if (decimal <= 1.0) return 1.0;
  return 1.0 / decimal;
}

/**
 * Converts implied probability to Decimal odds.
 */
export function impliedProbabilityToDecimal(prob: number): number {
  if (prob <= 0) return 1000.0; // cap
  return 1.0 / Math.min(1.0, prob);
}

/**
 * Resolves all representation formats given a decimal value.
 */
export function resolveOdds(decimal: number): OddsValue {
  const dec = Math.max(1.01, decimal);
  return {
    decimal: Number(dec.toFixed(3)),
    fractional: decimalToFractional(dec),
    american: decimalToAmerican(dec),
    impliedProbability: Number(decimalToImpliedProbability(dec).toFixed(5))
  };
}
