import { logger } from './logger';
import { luhnCheck } from './util';

export const sanitizePersonNumber = (input: string | undefined | null): string => {
  if (!input) return '';

  const raw = input.trim();
  const isCentenarian = raw.includes('+');
  const isDashSeparated = raw.includes('-');
  const digits = raw.replace(/\D/g, '');
  logger.info(
    `Sanitizing person number: length=${digits.length}, isCentenarian=${isCentenarian}, isDashSeparated=${isDashSeparated}`,
  );

  if (digits.length === 12) {
    return digits;
  }

  if (digits.length === 10) {
    const yearSuffix = Number(digits.slice(0, 2));
    const currentYear = new Date().getFullYear();
    let fullYear = Math.floor(currentYear / 100) * 100 + yearSuffix;
    // A birth year can't be in the future — roll back a century if it is.
    if (fullYear > currentYear) {
      fullYear -= 100;
    }
    // "+" separator means the person is 100 years or older.
    if (isCentenarian) {
      fullYear -= 100;
    }
    return `${fullYear}${digits.slice(2)}`;
  }

  return digits;
};

export const parsePersonNumber = (input: unknown): string | undefined => {
  if (typeof input !== 'string' || !/^\s*(\d{6}|\d{8})[-+]?\d{4}\s*$/.test(input)) return undefined;

  const normalized = sanitizePersonNumber(input);

  return /^\d{12}$/.test(normalized) && luhnCheck(normalized) ? normalized : undefined;
};
