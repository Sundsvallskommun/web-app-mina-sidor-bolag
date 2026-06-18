import { sanitizePersonNumber } from '@utils/sanitizePersonNumber';

describe('sanitizePersonNumber', () => {
  // [description, input, expected 12-digit output]
  const cases: Array<[string, string | null | undefined, string]> = [
    ['returns clean 12-digit input unchanged', '199001011234', '199001011234'],
    ['strips a separator from 12-digit input', '19900101-1234', '199001011234'],
    ['strips spaces and stray characters', ' 19900101 1234 ', '199001011234'],
    // "90" maps to 1990, not 2090, since a birth year can't be in the future.
    ['expands 10-digit input using the inferred century', '9001011234', '199001011234'],
    ['expands 10-digit input with a dash separator', '900101-1234', '199001011234'],
    // Without "+", "20" would resolve to 2020; "+" rolls it back a century to 1920.
    ['treats a "+" separator as 100 years or older', '200101+1234', '192001011234'],
    ['returns empty string for undefined input', undefined, ''],
    ['returns empty string for null input', null, ''],
    ['returns empty string for empty input', '', ''],
    ['returns digit-stripped input for unexpected lengths', '12345', '12345'],
  ];

  it.each(cases)('%s', (_description, input, expected) => {
    expect(sanitizePersonNumber(input)).toBe(expected);
  });
});
