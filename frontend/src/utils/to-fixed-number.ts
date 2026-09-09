/**
 * Rounds a number to a fixed number of digits without converting it to a string.
 */
export function toFixedNumber(value: number, digits: number, base: number = 10): number {
  const pow = Math.pow(base, digits);

  return Math.round(value * pow) / pow;
}
