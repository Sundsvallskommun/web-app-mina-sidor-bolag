import { buildActivityFilter, getActivitySourceTypes } from '@utils/event-log-filter';
import { EXPORT_SOURCE_TYPE } from '@/constants/event-log';

const NAMESPACE = 'BolagenMinaSidor';

describe('getActivitySourceTypes', () => {
  it('returns only Login for the "login" category', () => {
    expect(getActivitySourceTypes('login')).toEqual(['Login']);
  });

  it('returns only HAN for the "han" category', () => {
    expect(getActivitySourceTypes('han')).toEqual(['HAN']);
  });

  it('returns all activity source types for "all"', () => {
    expect(getActivitySourceTypes('all')).toEqual(['Login', 'Impersonation', 'HAN']);
  });

  it('defaults to all activity source types for unknown/empty input', () => {
    expect(getActivitySourceTypes(undefined)).toEqual(['Login', 'Impersonation', 'HAN']);
    expect(getActivitySourceTypes('')).toEqual(['Login', 'Impersonation', 'HAN']);
    expect(getActivitySourceTypes('nonsense')).toEqual(['Login', 'Impersonation', 'HAN']);
  });

  it('is case-insensitive', () => {
    expect(getActivitySourceTypes('LOGIN')).toEqual(['Login']);
  });

  it('treats null like missing input (defaults to all)', () => {
    expect(getActivitySourceTypes(null)).toEqual(['Login', 'Impersonation', 'HAN']);
  });

  it('defaults to all for non-string input (string[] / nested object query params)', () => {
    expect(getActivitySourceTypes(['login'])).toEqual(['Login', 'Impersonation', 'HAN']);
    expect(getActivitySourceTypes(['login', 'han'])).toEqual(['Login', 'Impersonation', 'HAN']);
    expect(getActivitySourceTypes({ foo: 'bar' })).toEqual(['Login', 'Impersonation', 'HAN']);
  });

  it('never includes the export source type', () => {
    for (const sourceTypeFilter of ['all', 'login', 'han', undefined]) {
      expect(getActivitySourceTypes(sourceTypeFilter)).not.toContain(EXPORT_SOURCE_TYPE);
    }
  });
});

describe('buildActivityFilter', () => {
  it('scopes to the namespace and a single source type for "login"', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'login' })).toBe(
      "owner:'BolagenMinaSidor' and sourceType:'Login'",
    );
  });

  it('wraps multiple source types in parentheses joined by or for "all"', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'all' })).toBe(
      "owner:'BolagenMinaSidor' and (sourceType:'Login' or sourceType:'Impersonation' or sourceType:'HAN')",
    );
  });

  it('forwards the from/to created-range as-is', () => {
    expect(
      buildActivityFilter({
        namespace: NAMESPACE,
        sourceTypeFilter: 'login',
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T23:59:59.999Z',
      }),
    ).toBe(
      "owner:'BolagenMinaSidor' and sourceType:'Login' and created >= '2026-01-01T00:00:00.000Z' and created <= '2026-01-31T23:59:59.999Z'",
    );
  });

  it('builds a single source type filter for "han"', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'han' })).toBe(
      "owner:'BolagenMinaSidor' and sourceType:'HAN'",
    );
  });

  it('appends only the "from" bound', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'login', from: '2026-01-01' })).toBe(
      "owner:'BolagenMinaSidor' and sourceType:'Login' and created >= '2026-01-01'",
    );
  });

  it('appends only the "to" bound', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'login', to: '2026-01-31' })).toBe(
      "owner:'BolagenMinaSidor' and sourceType:'Login' and created <= '2026-01-31'",
    );
  });

  it('ignores empty-string date bounds', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'login', from: '', to: '' })).toBe(
      "owner:'BolagenMinaSidor' and sourceType:'Login'",
    );
  });

  it('never includes the export source type', () => {
    expect(buildActivityFilter({ namespace: NAMESPACE, sourceTypeFilter: 'all' })).not.toContain(EXPORT_SOURCE_TYPE);
  });
});
