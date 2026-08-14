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

/**
 * The invoice number cannot be derived from the session, so this searches the
 * caller's own list for it. Costs one platform API call per page.
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

  const url = customerInvoicesUrl();

  for (let page = 1; page <= MAX_SEARCH_PAGES; page++) {
    const res = await resolveOrDeny(
      () =>
        api.get<CustomerInvoicesResponse>(
          {
            url,
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

    const invoices = res?.data?.invoices ?? [];
    const match = invoices.find(invoice => invoice.invoiceNumber === invoiceNumber);

    if (match) {
      // Pin the requested issuer to the one on this invoice, not to our own
      // relations: under delegated billing another company issues it legitimately.
      if (match.organizationNumber && match.organizationNumber !== organizationNumber) {
        deny('invoice issuer', organizationNumber, actingPartyId);
      }
      return match;
    }

    const totalPages = res?.data?._meta?.totalPages ?? page;
    if (!invoices.length || page >= totalPages) {
      break;
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
