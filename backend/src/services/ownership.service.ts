import { BFUS_EXTERNAL_ID, MUNICIPALITY_ID, NAMESPACE } from '@config';
import { getApiBase } from '@/config/api-config';
import { ContactSetting, Delegate } from '@/data-contracts/contactsettings/data-contracts';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import { BFUSCustomerResponse, BFUSEligablePartyResponse } from '@/interfaces/bfus.interface';
import { MandateDetails, Mandates } from '@/data-contracts/myrepresentatives/data-contracts';
import { CustomerInvoice, CustomerInvoicesResponse } from '@/responses/invoices.response';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { RepresentingBusinessEntity, RepresentingMode } from '@interfaces/representing.interface';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { logger } from '@utils/logger';
import ApiService from './api.service';
import { customerInvoicesUrl, getInvoicePeriodFrom } from './invoices.service';
import { sessionCacheService } from './session-cache.service';

/**
 * Per-object authorization. The platform APIs authenticate the application rather
 * than the end user, so ownership has to be decided here.
 *
 * Every action that takes an object id from the client should call one of these.
 * Each fetches the object from the platform API, compares its owner against the
 * session, and either returns it - so the caller need not fetch it again - or
 * throws 403.
 */

const api = new ApiService();

const contactSettingsBase = () => `${getApiBase('contactsettings')}/${MUNICIPALITY_ID}`;
const installedBaseBase = () => `${getApiBase('installedbase')}/${MUNICIPALITY_ID}`;
const mandatesBase = () => `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}`;

/** Pages to walk when searching a paged platform API list before giving up. */
const MAX_SEARCH_PAGES = 20;
const SEARCH_PAGE_SIZE = 100;

/**
 * The single party this session acts as. Deliberately not "any party the user has
 * some relation to": it mirrors how reads are scoped, so what you may change is
 * exactly what you may see.
 */
export function getActingPartyId(req: RequestWithUser): string {
  const representing = req.session?.representing;
  const partyId = representing ? getRepresentingPartyId(representing) : undefined;

  if (!partyId) {
    throw new HttpException(403, 'MISSING_REPRESENTING_CONTEXT');
  }

  return partyId;
}

/**
 * Refuses access with a uniform message, so the response cannot be used to tell
 * "not yours" apart from "does not exist".
 */
function deny(resource: string, id: string, actingPartyId: string): never {
  logger.warn(`Ownership denied: ${resource} '${id}' is not owned by party '${actingPartyId}'`);
  throw new HttpException(403, 'MISSING_PERMISSIONS');
}

/**
 * HttpError forces its own prototype in the constructor, so `instanceof
 * HttpException` is always false. Read the status off the object instead.
 */
function statusOf(error: unknown): number | undefined {
  const candidate = error as { status?: unknown; httpCode?: unknown };
  const status = candidate?.status ?? candidate?.httpCode;
  return typeof status === 'number' ? status : undefined;
}

/** A 404 or 403 from the platform API must look like a failed ownership check. */
async function resolveOrDeny<T>(
  load: () => Promise<T>,
  resource: string,
  id: string,
  actingPartyId: string,
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    const status = statusOf(error);
    if (status === 404 || status === 403) {
      deny(resource, id, actingPartyId);
    }
    throw error;
  }
}

async function fetchContactSetting(
  req: RequestWithUser,
  contactSettingId: string,
  actingPartyId: string,
): Promise<ContactSetting> {
  const url = `${contactSettingsBase()}/settings/${contactSettingId}`;
  const res = await resolveOrDeny(
    () => api.get<ContactSetting>({ url }, req.user),
    'contact setting',
    contactSettingId,
    actingPartyId,
  );

  if (!res?.data) {
    deny('contact setting', contactSettingId, actingPartyId);
  }

  return res.data;
}

/**
 * A setting belongs to a party directly, or - when virtual - to whoever owns the
 * setting that created it.
 */
export async function assertOwnsContactSetting(
  req: RequestWithUser,
  contactSettingId: string,
): Promise<ContactSetting> {
  const actingPartyId = getActingPartyId(req);

  if (!contactSettingId) {
    throw new HttpException(400, 'Bad Request');
  }

  const setting = await fetchContactSetting(req, contactSettingId, actingPartyId);

  if (setting.partyId) {
    if (setting.partyId !== actingPartyId) {
      deny('contact setting', contactSettingId, actingPartyId);
    }
    return setting;
  }

  if (setting.createdById) {
    const parent = await fetchContactSetting(req, setting.createdById, actingPartyId);
    // One level only; a longer chain could be arranged to obscure the real owner.
    if (!parent.partyId || parent.partyId !== actingPartyId) {
      deny('contact setting', contactSettingId, actingPartyId);
    }
    return setting;
  }

  deny('contact setting', contactSettingId, actingPartyId);
}

/** Contact setting ids owned by the acting party, used as delegate principals. */
async function getOwnedPrincipalIds(req: RequestWithUser, actingPartyId: string): Promise<string[]> {
  const url = `${contactSettingsBase()}/settings`;
  const params = { partyId: actingPartyId, page: 1, limit: SEARCH_PAGE_SIZE };

  try {
    const res = await api.get<ContactSetting[]>({ url, params }, req.user);
    return (res?.data ?? []).map(setting => setting.id).filter(Boolean);
  } catch (error) {
    if (statusOf(error) === 404) {
      return [];
    }
    throw error;
  }
}

async function listDelegates(req: RequestWithUser, principalId: string): Promise<Delegate[]> {
  const url = `${contactSettingsBase()}/delegates`;

  try {
    const res = await api.get<Delegate[]>({ url, params: { principalId } }, req.user);
    return res?.data ?? [];
  } catch (error) {
    if (statusOf(error) === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * A delegate belongs to the party behind its principal setting. Resolved by listing
 * our own delegates, which relies only on endpoints already in use.
 */
export async function assertOwnsDelegate(req: RequestWithUser, delegateId: string): Promise<Delegate> {
  const actingPartyId = getActingPartyId(req);

  if (!delegateId) {
    throw new HttpException(400, 'Bad Request');
  }

  const principalIds = await getOwnedPrincipalIds(req, actingPartyId);

  for (const principalId of principalIds) {
    const match = (await listDelegates(req, principalId)).find(delegate => delegate.id === delegateId);
    if (match) {
      return match;
    }
  }

  deny('delegate', delegateId, actingPartyId);
}

/** Guards a principal id taken from the request body. */
export async function assertOwnsPrincipal(req: RequestWithUser, principalId: string): Promise<void> {
  await assertOwnsContactSetting(req, principalId);
}

/**
 * Guards the setting a new one is created under: `createdById` makes the new record
 * virtual and owned by that setting's owner, so the body decides ownership and has
 * to be verified. No id means an ordinary setting owned by the acting party.
 */
export const assertOwnsParentSetting = async (req: RequestWithUser, createdById?: string): Promise<void> => {
  if (!createdById) return;

  await assertOwnsContactSetting(req, createdById);
};

/**
 * Facility delegations are owned by `owner`. Resolved through the same
 * list-by-owner endpoint the read path uses.
 */
export async function assertOwnsFacilityDelegation(req: RequestWithUser, delegationId: string): Promise<Delegation> {
  const actingPartyId = getActingPartyId(req);

  if (!delegationId) {
    throw new HttpException(400, 'Bad Request');
  }

  const url = `${installedBaseBase()}/delegations`;
  const res = await resolveOrDeny(
    () => api.get<Delegation[]>({ url, params: { owner: actingPartyId } }, req.user),
    'facility delegation',
    delegationId,
    actingPartyId,
  );

  const match = (res?.data ?? []).find(delegation => delegation.id === delegationId);

  if (!match) {
    deny('facility delegation', delegationId, actingPartyId);
  }

  return match;
}

/**
 * The organization this session may administer mandates for, or a 403. Requires
 * business mode, not merely a business left in the session after switching back to
 * private. Mirrors the rule in `mandate.middleware.ts` - keep the two in step.
 */
export function getAdministrableBusiness(req: RequestWithUser): RepresentingBusinessEntity {
  const representing = req.session?.representing;

  if (representing?.mode !== RepresentingMode.BUSINESS || !representing.BUSINESS?.partyId) {
    throw new HttpException(403, 'NOT_REPRESENTING_ORGANIZATION');
  }

  const business = representing.BUSINESS;

  if (!business.isAuthorizedSignatory && !business.whitelisted) {
    logger.warn(`Denied: party '${business.partyId}' may not administer mandates`);
    throw new HttpException(403, 'MISSING_PERMISSIONS');
  }

  return business;
}

/**
 * Facility ids the session may read: the represented party's own plus those
 * delegated to it. Resolved from the platform API when the session cache is built.
 */
export function getAccessibleFacilityIds(req: RequestWithUser): Set<string> {
  const cache = req.session?.cache;
  const ids = new Set<string>();

  for (const facility of cache?.facilities ?? []) {
    if (facility.facilityId) ids.add(facility.facilityId);
  }

  for (const delegation of cache?.delegations ?? []) {
    for (const facility of delegation.facilities ?? []) {
      if (facility.id) ids.add(facility.id);
    }
  }

  return ids;
}

/** Guards reads keyed by facility id. Session-local, so it makes no API call. */
export function assertOwnsFacility(req: RequestWithUser, facilityId: string): void {
  const actingPartyId = getActingPartyId(req);

  if (!facilityId) {
    throw new HttpException(400, 'Bad Request');
  }

  const accessible = getAccessibleFacilityIds(req);

  if (!accessible.size) {
    // Nothing to compare against, so refuse rather than fall through.
    logger.warn(`Ownership denied: no facilities cached for party '${actingPartyId}'`);
    throw new HttpException(403, 'MISSING_FACILITY_CONTEXT');
  }

  if (!accessible.has(facilityId)) {
    deny('facility', facilityId, actingPartyId);
  }
}

/** How many invoice pages to request at once while searching. */
const INVOICE_SEARCH_CONCURRENCY = 5;

const fetchInvoicePage = async (
  req: RequestWithUser,
  customerNumbers: string[],
  page: number,
  invoiceNumber: string,
  actingPartyId: string,
) =>
  resolveOrDeny(
    () =>
      api.get<CustomerInvoicesResponse>(
        {
          url: customerInvoicesUrl(),
          // Customer number is what ties the result to the caller. No issuer
          // filter: under delegated billing the issuer is a company the customer
          // has no relation with, so filtering on ours would hide those invoices.
          params: {
            customerNumbers: customerNumbers.toString(),
            periodFrom: getInvoicePeriodFrom(),
            page,
            limit: SEARCH_PAGE_SIZE,
            sortDirection: 'DESC',
          },
        },
        req.user,
      ),
    'invoice',
    invoiceNumber,
    actingPartyId,
  );

/**
 * The invoice number cannot be derived from the session, so this searches the
 * caller's own list for it.
 *
 * The list is paged and can run to thousands of invoices over the search window,
 * so pages are requested in batches rather than one at a time - walking them in
 * sequence took long enough to hit the gateway timeout before the PDF was ever
 * fetched. Each batch is scanned in page order, so the result does not depend on
 * which request finishes first.
 */
export async function assertOwnsInvoice(
  req: RequestWithUser,
  organizationNumber: string,
  invoiceNumber: string,
): Promise<CustomerInvoice> {
  const actingPartyId = getActingPartyId(req);

  if (!invoiceNumber || !organizationNumber) {
    throw new HttpException(400, 'Bad Request');
  }

  const customerNumbers = req.session?.cache?.relations?.customerNumber ?? [];

  if (!customerNumbers.length) {
    logger.warn(`Ownership denied: no customer relations cached for party '${actingPartyId}'`);
    throw new HttpException(403, 'MISSING_CUSTOMER_CONTEXT');
  }

  const accept = (match: CustomerInvoice): CustomerInvoice => {
    // Pin the requested issuer to the one on this invoice, not to our own
    // relations: under delegated billing another company issues it legitimately.
    if (match.organizationNumber && match.organizationNumber !== organizationNumber) {
      deny('invoice issuer', organizationNumber, actingPartyId);
    }
    return match;
  };

  const first = await fetchInvoicePage(req, customerNumbers, 1, invoiceNumber, actingPartyId);
  const firstMatch = (first?.data?.invoices ?? []).find(invoice => invoice.invoiceNumber === invoiceNumber);
  if (firstMatch) return accept(firstMatch);

  const lastPage = Math.min(first?.data?._meta?.totalPages ?? 1, MAX_SEARCH_PAGES);

  for (let page = 2; page <= lastPage; page += INVOICE_SEARCH_CONCURRENCY) {
    const batch = [];
    for (let offset = 0; offset < INVOICE_SEARCH_CONCURRENCY && page + offset <= lastPage; offset++) {
      batch.push(fetchInvoicePage(req, customerNumbers, page + offset, invoiceNumber, actingPartyId));
    }

    for (const res of await Promise.all(batch)) {
      const match = (res?.data?.invoices ?? []).find(invoice => invoice.invoiceNumber === invoiceNumber);
      if (match) return accept(match);
    }
  }

  deny('invoice', invoiceNumber, actingPartyId);
}

/**
 * Only the granting organization may revoke, and only with the authority needed to
 * create one.
 */
export async function assertIsMandateGrantor(req: RequestWithUser, mandateId: string): Promise<MandateDetails> {
  if (!mandateId) {
    throw new HttpException(400, 'Bad Request');
  }

  const business = getAdministrableBusiness(req);
  const url = `${mandatesBase()}/mandates`;

  for (let page = 1; page <= MAX_SEARCH_PAGES; page++) {
    const res = await resolveOrDeny(
      () =>
        api.get<Mandates>(
          { url, params: { grantorPartyId: business.partyId, page, limit: SEARCH_PAGE_SIZE } },
          req.user,
        ),
      'mandate',
      mandateId,
      business.partyId,
    );

    const mandates = res?.data?.mandateDetailsList ?? [];
    const match = mandates.find(mandate => mandate.id === mandateId);

    if (match) {
      return match;
    }

    const totalPages = res?.data?._meta?.totalPages ?? page;
    if (!mandates.length || page >= totalPages) {
      break;
    }
  }

  deny('mandate', mandateId, business.partyId);
}

const bfusBase = () => getApiBase('bfus');

export const getAccessibleBfusCustomerIds = async (req: RequestWithUser): Promise<number[]> => {
  await sessionCacheService.cacheRelations(req);

  const relations = req.session?.cache?.relations;
  const customerNumbers = Array.from(
    new Set([
      ...(relations?.customerNumber ?? []),
      ...(relations?.customerRelations?.map(relation => relation.customerNumber).filter(Boolean) ?? []),
    ]),
  );

  if (!customerNumbers.length) {
    throw new HttpException(400, 'No BFUS customer number available');
  }

  const results = await Promise.allSettled(
    customerNumbers.map(customerNumber =>
      api.get<BFUSCustomerResponse>(
        { url: `${bfusBase()}/EP/Customer/GetEPCustomerByCode_v1/${BFUS_EXTERNAL_ID}/${customerNumber}` },
        req.user,
      ),
    ),
  );

  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value.data.Content.Customer.CustomerId);
};

export const assertOwnsBfusCustomers = async (req: RequestWithUser, requested: number[]): Promise<void> => {
  const actingPartyId = getActingPartyId(req);
  const accessible = new Set(await getAccessibleBfusCustomerIds(req));

  for (const customerId of requested) {
    if (!accessible.has(customerId)) {
      deny('BFUS customer', String(customerId), actingPartyId);
    }
  }
};

export const getAccessibleBfusContractIds = async (req: RequestWithUser): Promise<Set<number>> => {
  const customerIds = await getAccessibleBfusCustomerIds(req);

  const results = await Promise.allSettled(
    customerIds.map(customerId =>
      api.get<BFUSEligablePartyResponse>(
        { url: `${bfusBase()}/EP/EligableParty/EligablePartyPermissions/${BFUS_EXTERNAL_ID}/${customerId}` },
        req.user,
      ),
    ),
  );

  const contractIds = new Set<number>();
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const part of result.value.data.Content.EligablePartyParts ?? []) {
      if (typeof part.ContractId === 'number') contractIds.add(part.ContractId);
    }
  }

  return contractIds;
};

export const assertOwnsBfusContracts = async (req: RequestWithUser, contractIds: number[]): Promise<void> => {
  const actingPartyId = getActingPartyId(req);
  const accessible = await getAccessibleBfusContractIds(req);

  for (const contractId of contractIds) {
    if (!accessible.has(contractId)) {
      deny('BFUS contract', String(contractId), actingPartyId);
    }
  }
};

/**
 * How many listed invoices to remember. A session lives for days, so the record is
 * capped and the oldest entries fall out first.
 */
const MAX_LISTED_INVOICES = 500;

/**
 * Notes the invoices handed to this session, keyed by invoice number.
 *
 * The listing endpoints already scope their query to the session's own customer
 * numbers and facilities, so anything they return has been through an ownership
 * decision. Recording it here lets the download reuse that decision instead of
 * repeating the search.
 */
export const rememberListedInvoices = (req: RequestWithUser, invoices: CustomerInvoice[]): void => {
  if (!req.session) return;

  req.session.cache = req.session.cache ?? {};
  const listed = req.session.cache.listedInvoices ?? {};

  for (const invoice of invoices) {
    if (invoice.invoiceNumber) {
      listed[invoice.invoiceNumber] = invoice.organizationNumber ?? '';
    }
  }

  const numbers = Object.keys(listed);
  for (const stale of numbers.slice(0, Math.max(0, numbers.length - MAX_LISTED_INVOICES))) {
    delete listed[stale];
  }

  req.session.cache.listedInvoices = listed;
};

/**
 * Guards the invoice document by what this session has already been shown.
 *
 * The ownership search this replaces asked the platform to find the invoice among
 * the caller's own, which needs a query filtered on customer number alone - one the
 * invoice API cannot answer in production. The download is always reached from a
 * listed invoice, so the listing is where the decision can be made cheaply.
 */
export const assertInvoiceWasListed = (
  req: RequestWithUser,
  organizationNumber: string,
  invoiceNumber: string,
): void => {
  const actingPartyId = getActingPartyId(req);

  if (!invoiceNumber || !organizationNumber) {
    throw new HttpException(400, 'Bad Request');
  }

  const listed = req.session?.cache?.listedInvoices ?? {};

  if (!Object.prototype.hasOwnProperty.call(listed, invoiceNumber)) {
    deny('invoice', invoiceNumber, actingPartyId);
  }

  // Empty means the listing carried no issuer, so there is nothing to pin it to.
  const issuer = listed[invoiceNumber];
  if (issuer && issuer !== organizationNumber) {
    deny('invoice issuer', organizationNumber, actingPartyId);
  }
};
