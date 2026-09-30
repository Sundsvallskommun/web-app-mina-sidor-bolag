const PERSON_NUMBER_PATTERNS: Array<[RegExp, string]> = [
  [/(citizen\/[^/]+\/[^/]+\/)[^/]+(\/guid)/gi, '$1[REDACTED]$2'],
  [/(engagements\/person\/)[^/?]+/gi, '$1[REDACTED]'],
];

export const redactPersonNumber = (value?: string): string =>
  PERSON_NUMBER_PATTERNS.reduce(
    (redacted, [pattern, replacement]) => redacted.replace(pattern, replacement),
    value ?? '',
  );
