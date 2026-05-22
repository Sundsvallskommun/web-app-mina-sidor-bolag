import { sanitizePersonNumber } from '@utils/sanitizePersonNumber';

describe('sanitizePersonNumber', () => {
  it('returns clean 12-digit input unchanged', () => {
    expect(sanitizePersonNumber('199001011234')).toBe('199001011234');
  });

  it('strips a separator from 12-digit input', () => {
    expect(sanitizePersonNumber('19900101-1234')).toBe('199001011234');
  });

  it('strips spaces and stray characters', () => {
    expect(sanitizePersonNumber(' 19900101 1234 ')).toBe('199001011234');
  });

  it('expands 10-digit input to 12 digits using the inferred century', () => {
    // A 1990-born person: "90" maps to 1990, not 2090 (future).
    expect(sanitizePersonNumber('9001011234')).toBe('199001011234');
  });

  it('expands 10-digit input with a dash separator', () => {
    expect(sanitizePersonNumber('900101-1234')).toBe('199001011234');
  });

  it('treats a "+" separator as 100 years or older', () => {
    // Without "+", "20" would resolve to 2020; "+" rolls it back to 1920.
    expect(sanitizePersonNumber('200101+1234')).toBe('192001011234');
  });

  it('returns an empty string for nullish input', () => {
    expect(sanitizePersonNumber(undefined)).toBe('');
    expect(sanitizePersonNumber(null)).toBe('');
    expect(sanitizePersonNumber('')).toBe('');
  });

  it('returns digit-stripped input for unexpected lengths rather than fabricating a number', () => {
    expect(sanitizePersonNumber('12345')).toBe('12345');
  });
});
