import { MUNICIPALITY_ID, NAMESPACE } from '@config';
import { getApiBase } from '@/config/api-config';
import { ContactSetting, Delegate } from '@/data-contracts/contactsettings/data-contracts';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import { MandateDetails, Mandates } from '@/data-contracts/myrepresentatives/data-contracts';
import { CustomerInvoice, CustomerInvoicesResponse } from '@/responses/invoices.response';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { RepresentingBusinessEntity, RepresentingMode } from '@interfaces/representing.interface';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { logger } from '@utils/logger';
import ApiService from './api.service';
import { customerInvoicesUrl, getInvoicePeriodFrom } from './invoices.service';

/**
 * Per-object authorization.
 *
 * The BFF authenticates to every upstream API with one machine token
 * (client_credentials), so the platform services cannot tell one end user from
 * another and will happily act on any object id they are handed. That makes this
 * layer the only thing standing between a valid session and someone else's data.
 *
 * The global auth guard answers "is someone logged in". These helpers answer the
 * separate question "does this session own the object it is addressing", and must
 * be called by every action that takes an object id from the client.
 *
 * Each helper resolves the object upstream, compares its owner against the
 * session, and either returns the object or throws 403. Callers can use the
 * returned object instead of fetching it again.
 */

const api = new ApiService();

const contactSettingsBase = () => `${getApiBase('contactsettings')}/${MUNICIPALITY_ID}`;
const installedBaseBase = () => `${getApiBase('installedbase')}/${MUNICIPALITY_ID}`;
const mandatesBase = () => `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}`;

/** Pages to walk when searching a paged upstream list before giving up. */
const MAX_SEARCH_PAGES = 20;
const SEARCH_PAGE_SIZE = 100;

/**
 * The partyId this session is currently acting as: the represented private person
 * or organization. Deliberately a single identity rather than "any party the user
 * has some relation to" - it mirrors how the read endpoints scope their queries,
 * so what you can change is exactly what you can see.
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
 * Refuses access. The message is deliberately uniform: a caller must not be able
 * to tell "exists but not yours" from "does not exist", or object ids become
 * enumerable through the error response.
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

/** Upstream 404/403 must look the same as a failed ownership check. */
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
 * Contact settings belong to a party directly, except for virtual ones. A virtual
 * setting represents a delegate who is not themselves a customer; it carries no
 * partyId and is owned by the setting that created it.
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
    // Only one level up: that is how the delegate flow creates them, and following
    // an arbitrary chain would let a crafted parent launder ownership.
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
 * A delegate is owned by the party behind its principal contact setting. Resolved
 * by listing the acting party's own delegates rather than fetching the delegate by
 * id, so this only relies on upstream endpoints the app already uses.
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

/**
 * Guards the principal a delegate is being attached to, for create and update
 * where the principal id comes from the request body.
 */
export async function assertOwnsPrincipal(req: RequestWithUser, principalId: string): Promise<void> {
  await assertOwnsContactSetting(req, principalId);
}

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
 * The organization this session may administer mandates for, or a 403.
 *
 * Requires the session to actually be *in* business mode, not merely to have a
 * business left over in the session from an earlier selection - `postRepresenting`
 * keeps `BUSINESS` populated when you switch back to private. Everything else here
 * goes through `getRepresentingPartyId`, which respects the mode, so this does too.
 *
 * The permission rule mirrors `mandate.middleware.ts`: a signatory, or someone the
 * organization has whitelisted through an active mandate. Keep them in step.
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
 * Facility ids the session may read data for: the facilities of the represented
 * party plus those delegated to it. Populated by `/me`, which the frontend calls
 * from its login guard before any page renders.
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

/**
 * Guards reads keyed by facility id. Purely session-local - the accessible set is
 * already resolved upstream when the session cache is built.
 */
export function assertOwnsFacility(req: RequestWithUser, facilityId: string): void {
  const actingPartyId = getActingPartyId(req);

  if (!facilityId) {
    throw new HttpException(400, 'Bad Request');
  }

  const accessible = getAccessibleFacilityIds(req);

  if (!accessible.size) {
    // Nothing to compare against, so nothing can be proven. Refuse rather than
    // fall through, and make the cause distinguishable in the logs.
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
  facilityIds: string[],
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
            ...(facilityIds.length ? { facilityIds } : {}),
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

  const facilityIds = Array.from(getAccessibleFacilityIds(req));
  const first = await fetchInvoicePage(req, customerNumbers, facilityIds, 1, invoiceNumber, actingPartyId);
  const firstMatch = (first?.data?.invoices ?? []).find(invoice => invoice.invoiceNumber === invoiceNumber);
  if (firstMatch) return accept(firstMatch);

  const lastPage = Math.min(first?.data?._meta?.totalPages ?? 1, MAX_SEARCH_PAGES);

  for (let page = 2; page <= lastPage; page += INVOICE_SEARCH_CONCURRENCY) {
    const batch = [];
    for (let offset = 0; offset < INVOICE_SEARCH_CONCURRENCY && page + offset <= lastPage; offset++) {
      batch.push(fetchInvoicePage(req, customerNumbers, facilityIds, page + offset, invoiceNumber, actingPartyId));
    }

    for (const res of await Promise.all(batch)) {
      const match = (res?.data?.invoices ?? []).find(invoice => invoice.invoiceNumber === invoiceNumber);
      if (match) return accept(match);
    }
  }

  deny('invoice', invoiceNumber, actingPartyId);
}

/**
 * Mandates may only be revoked by the granting organization, and only by someone
 * who could have created one in the first place - so this mirrors the rule in
 * `mandate.middleware.ts`. Keep the two in step if that rule changes.
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
export const assertInvoiceAccess = async (
  req: RequestWithUser,
  organizationNumber: string,
  invoiceNumber: string,
): Promise<void> => {
  const actingPartyId = getActingPartyId(req);

  if (!invoiceNumber || !organizationNumber) {
    throw new HttpException(400, 'Bad Request');
  }

  const listed = req.session?.cache?.listedInvoices ?? {};

  if (Object.prototype.hasOwnProperty.call(listed, invoiceNumber)) {
    // Empty means the listing carried no issuer, so there is nothing to pin it to.
    const issuer = listed[invoiceNumber];
    if (issuer && issuer !== organizationNumber) {
      deny('invoice issuer', organizationNumber, actingPartyId);
    }
    return;
  }

  // The record can be incomplete: the invoice page loads both listings at once, and
  // the session store writes the whole session, so one response can overwrite what
  // the other just noted. Falling back to the search keeps that from denying a
  // download the caller is entitled to.
  await assertOwnsInvoice(req, organizationNumber, invoiceNumber);
};
