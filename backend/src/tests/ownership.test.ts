import 'reflect-metadata';
import { HttpException } from '@exceptions/HttpException';
import { RepresentingMode } from '@interfaces/representing.interface';

const apiGet = jest.fn();

jest.mock('@config', () => ({ MUNICIPALITY_ID: '2281', NAMESPACE: 'minasidorbolagen' }));
jest.mock('@/config/api-config', () => ({ getApiBase: (key: string) => key }));
jest.mock('@utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
  stream: { write: jest.fn() },
}));
jest.mock('@/services/api.service', () => ({
  __esModule: true,
  default: class MockApiService {
    get = apiGet;
  },
}));

import {
  assertIsMandateGrantor,
  assertOwnsContactSetting,
  assertOwnsDelegate,
  assertOwnsFacility,
  assertOwnsFacilityDelegation,
  assertOwnsInvoice,
  getActingPartyId,
} from '@/services/ownership.service';

const ME = 'party-me';
const SOMEONE_ELSE = 'party-victim';

/** Session representing myself as a private person. */
function privateSession(partyId = ME): any {
  return {
    user: { partyId, username: 'unknown' },
    session: { representing: { mode: RepresentingMode.PRIVATE, PRIVATE: { partyId } } },
  };
}

function businessSession(partyId: string, isAuthorizedSignatory: boolean, whitelisted = false): any {
  return {
    user: { partyId: ME, username: 'unknown' },
    session: {
      representing: { mode: RepresentingMode.BUSINESS, BUSINESS: { partyId, isAuthorizedSignatory, whitelisted } },
    },
  };
}

/** Routes mock responses by URL fragment so tests read as upstream fixtures. */
function upstream(routes: { match: string; params?: (p: any) => boolean; data: any }[]) {
  apiGet.mockImplementation(async ({ url, params }: any) => {
    const hit = routes.find(route => url.includes(route.match) && (!route.params || route.params(params ?? {})));
    if (!hit) throw new HttpException(404, 'Not found');
    return { data: hit.data, message: 'success' };
  });
}

async function expectForbidden(promise: Promise<unknown>) {
  await expect(promise).rejects.toMatchObject({ status: 403 });
}

beforeEach(() => {
  apiGet.mockReset();
});

describe('getActingPartyId', () => {
  it('returns the represented party', () => {
    expect(getActingPartyId(privateSession())).toBe(ME);
  });

  // Asserted on status rather than instanceof: HttpError overwrites its own
  // prototype in the constructor, so `instanceof HttpException` is never true.
  it('refuses a session with no representing context', () => {
    expect(() => getActingPartyId({ session: {} } as any)).toThrow(/MISSING_REPRESENTING_CONTEXT/);
    expect(() => getActingPartyId({ session: {} } as any)).toThrow(expect.objectContaining({ status: 403 }));
  });

  it('refuses an admin session, which represents no party', () => {
    const admin = { user: {}, session: { representing: { mode: RepresentingMode.ADMIN } } } as any;
    expect(() => getActingPartyId(admin)).toThrow(/MISSING_REPRESENTING_CONTEXT/);
  });
});

describe('assertOwnsContactSetting', () => {
  it('allows a setting belonging to the acting party', async () => {
    upstream([{ match: 'settings/cs-mine', data: { id: 'cs-mine', partyId: ME } }]);
    await expect(assertOwnsContactSetting(privateSession(), 'cs-mine')).resolves.toMatchObject({ id: 'cs-mine' });
  });

  it('refuses another party settings (F3/F7)', async () => {
    upstream([{ match: 'settings/cs-victim', data: { id: 'cs-victim', partyId: SOMEONE_ELSE } }]);
    await expectForbidden(assertOwnsContactSetting(privateSession(), 'cs-victim'));
  });

  it('allows a virtual setting created by one of ours', async () => {
    upstream([
      { match: 'settings/cs-virtual', data: { id: 'cs-virtual', virtual: true, createdById: 'cs-mine' } },
      { match: 'settings/cs-mine', data: { id: 'cs-mine', partyId: ME } },
    ]);
    await expect(assertOwnsContactSetting(privateSession(), 'cs-virtual')).resolves.toMatchObject({ id: 'cs-virtual' });
  });

  it('refuses a virtual setting created by someone else', async () => {
    upstream([
      { match: 'settings/cs-virtual', data: { id: 'cs-virtual', virtual: true, createdById: 'cs-theirs' } },
      { match: 'settings/cs-theirs', data: { id: 'cs-theirs', partyId: SOMEONE_ELSE } },
    ]);
    await expectForbidden(assertOwnsContactSetting(privateSession(), 'cs-virtual'));
  });

  it('refuses a setting that is neither owned nor created by anyone', async () => {
    upstream([{ match: 'settings/cs-orphan', data: { id: 'cs-orphan' } }]);
    await expectForbidden(assertOwnsContactSetting(privateSession(), 'cs-orphan'));
  });

  it('answers 403 for an unknown id, so ids stay unguessable', async () => {
    upstream([]);
    await expectForbidden(assertOwnsContactSetting(privateSession(), 'cs-nonexistent'));
  });

  it('does not follow a chain of virtual parents', async () => {
    upstream([
      { match: 'settings/cs-a', data: { id: 'cs-a', createdById: 'cs-b' } },
      { match: 'settings/cs-b', data: { id: 'cs-b', createdById: 'cs-mine' } },
      { match: 'settings/cs-mine', data: { id: 'cs-mine', partyId: ME } },
    ]);
    await expectForbidden(assertOwnsContactSetting(privateSession(), 'cs-a'));
  });
});

describe('assertOwnsDelegate', () => {
  it('allows a delegate under one of our principals', async () => {
    upstream([
      { match: '/settings', params: p => p.partyId === ME, data: [{ id: 'cs-mine', partyId: ME }] },
      {
        match: '/delegates',
        params: p => p.principalId === 'cs-mine',
        data: [{ id: 'del-1', principalId: 'cs-mine' }],
      },
    ]);
    await expect(assertOwnsDelegate(privateSession(), 'del-1')).resolves.toMatchObject({ id: 'del-1' });
  });

  it('refuses a delegate belonging to another party (F6)', async () => {
    upstream([
      { match: '/settings', params: p => p.partyId === ME, data: [{ id: 'cs-mine', partyId: ME }] },
      {
        match: '/delegates',
        params: p => p.principalId === 'cs-mine',
        data: [{ id: 'del-1', principalId: 'cs-mine' }],
      },
    ]);
    await expectForbidden(assertOwnsDelegate(privateSession(), 'del-victim'));
  });

  it('refuses when the acting party has no contact settings at all', async () => {
    upstream([]);
    await expectForbidden(assertOwnsDelegate(privateSession(), 'del-1'));
  });
});

describe('assertOwnsFacilityDelegation', () => {
  it('allows a delegation we own', async () => {
    upstream([{ match: '/delegations', params: p => p.owner === ME, data: [{ id: 'fd-1', owner: ME }] }]);
    await expect(assertOwnsFacilityDelegation(privateSession(), 'fd-1')).resolves.toMatchObject({ id: 'fd-1' });
  });

  it('refuses a delegation owned by someone else (F5)', async () => {
    upstream([{ match: '/delegations', params: p => p.owner === ME, data: [{ id: 'fd-1', owner: ME }] }]);
    await expectForbidden(assertOwnsFacilityDelegation(privateSession(), 'fd-victim'));
  });

  it('queries upstream scoped to the acting party, never the requested id', async () => {
    upstream([{ match: '/delegations', data: [{ id: 'fd-1', owner: ME }] }]);
    await assertOwnsFacilityDelegation(privateSession(), 'fd-1');
    expect(apiGet).toHaveBeenCalledWith(expect.objectContaining({ params: { owner: ME } }), expect.anything());
  });
});

describe('assertIsMandateGrantor', () => {
  const ORG = 'party-org';

  it('allows a signatory revoking their organizations mandate', async () => {
    upstream([
      {
        match: '/mandates',
        params: p => p.grantorPartyId === ORG,
        data: { mandateDetailsList: [{ id: 'm-1' }], _meta: { totalPages: 1 } },
      },
    ]);
    await expect(assertIsMandateGrantor(businessSession(ORG, true), 'm-1')).resolves.toMatchObject({ id: 'm-1' });
  });

  it('refuses a mandate granted by another organization (F4)', async () => {
    upstream([{ match: '/mandates', data: { mandateDetailsList: [{ id: 'm-1' }], _meta: { totalPages: 1 } } }]);
    await expectForbidden(assertIsMandateGrantor(businessSession(ORG, true), 'm-victim'));
  });

  it('refuses when not representing an organization', async () => {
    await expect(assertIsMandateGrantor(privateSession(), 'm-1')).rejects.toThrow(/NOT_REPRESENTING_ORGANIZATION/);
    expect(apiGet).not.toHaveBeenCalled();
  });

  // postRepresenting keeps BUSINESS in the session when you switch back to private,
  // so checking that it merely exists would let a private-mode session through.
  it('refuses a private-mode session that still carries a business from earlier', async () => {
    const session = businessSession(ORG, true);
    session.session.representing.mode = RepresentingMode.PRIVATE;
    session.session.representing.PRIVATE = { partyId: ME };

    await expect(assertIsMandateGrantor(session, 'm-1')).rejects.toThrow(/NOT_REPRESENTING_ORGANIZATION/);
    expect(apiGet).not.toHaveBeenCalled();
  });

  it('refuses a non-signatory who is not whitelisted either', async () => {
    await expectForbidden(assertIsMandateGrantor(businessSession(ORG, false), 'm-1'));
    expect(apiGet).not.toHaveBeenCalled();
  });

  // mandate.middleware.ts lets a whitelisted delegate create mandates, so revoking
  // must accept the same authority or the UI breaks for them.
  it('allows a whitelisted non-signatory, matching the rule for creating one', async () => {
    upstream([{ match: '/mandates', data: { mandateDetailsList: [{ id: 'm-1' }], _meta: { totalPages: 1 } } }]);
    await expect(assertIsMandateGrantor(businessSession(ORG, false, true), 'm-1')).resolves.toMatchObject({
      id: 'm-1',
    });
  });

  it('walks past the first page before giving up', async () => {
    apiGet.mockImplementation(async ({ params }: any) => ({
      data:
        params.page === 1
          ? { mandateDetailsList: [{ id: 'm-other' }], _meta: { totalPages: 2 } }
          : { mandateDetailsList: [{ id: 'm-late' }], _meta: { totalPages: 2 } },
      message: 'success',
    }));

    await expect(assertIsMandateGrantor(businessSession(ORG, true), 'm-late')).resolves.toMatchObject({ id: 'm-late' });
    expect(apiGet).toHaveBeenCalledTimes(2);
  });

  it('stops paging when upstream reports no more pages', async () => {
    apiGet.mockResolvedValue({
      data: { mandateDetailsList: [{ id: 'm-1' }], _meta: { totalPages: 1 } },
      message: 'success',
    });
    await expectForbidden(assertIsMandateGrantor(businessSession(ORG, true), 'm-missing'));
    expect(apiGet).toHaveBeenCalledTimes(1);
  });
});

describe('assertOwnsFacility', () => {
  function sessionWithFacilities(facilities: string[], delegated: string[] = []): any {
    const req = privateSession();
    req.session.cache = {
      facilities: facilities.map(facilityId => ({ facilityId })),
      delegations: delegated.length ? [{ owner: SOMEONE_ELSE, facilities: delegated.map(id => ({ id })) }] : [],
    };
    return req;
  }

  it('allows a facility the session holds', () => {
    expect(() => assertOwnsFacility(sessionWithFacilities(['fac-1', 'fac-2']), 'fac-2')).not.toThrow();
  });

  it('allows a facility delegated to the session', () => {
    expect(() => assertOwnsFacility(sessionWithFacilities(['fac-1'], ['fac-del']), 'fac-del')).not.toThrow();
  });

  it('refuses an unrelated facility (F9)', () => {
    expect(() => assertOwnsFacility(sessionWithFacilities(['fac-1']), 'fac-victim')).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it('refuses rather than falls through when the cache is empty', () => {
    expect(() => assertOwnsFacility(sessionWithFacilities([]), 'fac-1')).toThrow(/MISSING_FACILITY_CONTEXT/);
  });

  it('needs no upstream call', () => {
    assertOwnsFacility(sessionWithFacilities(['fac-1']), 'fac-1');
    expect(apiGet).not.toHaveBeenCalled();
  });
});

describe('assertOwnsInvoice', () => {
  const ORG = '5566778899';

  function sessionWithRelations(): any {
    const req = privateSession();
    req.session.cache = {
      relations: {
        customerNumber: ['cust-1'],
        customerRelations: [{ customerNumber: 'cust-1', organizationNumber: ORG, organizationName: 'Elnat' }],
      },
    };
    return req;
  }

  it('allows an invoice that appears in our own list', async () => {
    upstream([
      { match: 'customers/invoices', data: { invoices: [{ invoiceNumber: 'INV-1' }], _meta: { totalPages: 1 } } },
    ]);
    await expect(assertOwnsInvoice(sessionWithRelations(), ORG, 'INV-1')).resolves.toMatchObject({
      invoiceNumber: 'INV-1',
    });
  });

  it('refuses an invoice that is not ours (F8)', async () => {
    upstream([
      { match: 'customers/invoices', data: { invoices: [{ invoiceNumber: 'INV-1' }], _meta: { totalPages: 1 } } },
    ]);
    await expectForbidden(assertOwnsInvoice(sessionWithRelations(), ORG, 'INV-victim'));
  });

  it('refuses an issuer we have no relation with, before calling upstream', async () => {
    upstream([{ match: 'customers/invoices', data: { invoices: [{ invoiceNumber: 'INV-1' }] } }]);
    await expectForbidden(assertOwnsInvoice(sessionWithRelations(), '9999999999', 'INV-1'));
    expect(apiGet).not.toHaveBeenCalled();
  });

  it('refuses when no customer relations are cached', async () => {
    await expect(assertOwnsInvoice(privateSession(), ORG, 'INV-1')).rejects.toThrow(/MISSING_CUSTOMER_CONTEXT/);
  });

  it('scopes the search to our customer numbers, never the requested invoice', async () => {
    upstream([
      { match: 'customers/invoices', data: { invoices: [{ invoiceNumber: 'INV-1' }], _meta: { totalPages: 1 } } },
    ]);
    await assertOwnsInvoice(sessionWithRelations(), ORG, 'INV-1');
    expect(apiGet).toHaveBeenCalledWith(
      expect.objectContaining({ params: expect.objectContaining({ customerNumbers: 'cust-1' }) }),
      expect.anything(),
    );
  });

  it('walks past the first page before giving up', async () => {
    apiGet.mockImplementation(async ({ params }: any) => ({
      data:
        params.page === 1
          ? { invoices: [{ invoiceNumber: 'INV-old' }], _meta: { totalPages: 2 } }
          : { invoices: [{ invoiceNumber: 'INV-late' }], _meta: { totalPages: 2 } },
      message: 'success',
    }));
    await expect(assertOwnsInvoice(sessionWithRelations(), ORG, 'INV-late')).resolves.toMatchObject({
      invoiceNumber: 'INV-late',
    });
    expect(apiGet).toHaveBeenCalledTimes(2);
  });
});
