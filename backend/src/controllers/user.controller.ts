import { Controller, Req, Get, Res } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import { CustomerRelation } from '@/data-contracts/customer/data-contracts';
import {
  Delegation,
  InstalledBaseItem,
  InstalledBaseItemMetaData,
} from '@/data-contracts/installedbase/data-contracts';
import { fetchInstalledBase, uniqueFacilities } from '@/services/installed-base.service';
import { FacilityAddress } from '@/interfaces/facility-address.interface';
import { getRepresentingPartyId, hasRepresentingContext } from '@utils/getRepresentingPartyId';
import dayjs from 'dayjs';
import { sessionCacheService } from '@/services/session-cache.service';
import { logger } from '@/utils/logger';
import { getSessionMarker } from '@utils/request-context';

interface UserData {
  name: string;
  relations?: { customerNumber: string[]; customerRelations: CustomerRelation[] };
  addresses?: FacilityAddress[];
  facilities?: InstalledBaseItem[];
  delegations?: Delegation[];
  extendedView: boolean;
  isExtendingView: boolean;
}

function facilityActiveLastThreeYears(installation: InstalledBaseItem): boolean {
  // Facilities are considered active if the `facilityCommitmentEndDate` is undefined or within the last three years.
  const facilityIsActive =
    typeof installation.facilityCommitmentEndDate === 'undefined' ||
    dayjs(installation.facilityCommitmentEndDate).isAfter(dayjs().subtract(3, 'year')) ||
    dayjs(installation.facilityCommitmentEndDate).isSame(dayjs(), 'day');
  return facilityIsActive;
}

function relevantType(installation: InstalledBaseItem): boolean {
  const relevantTypes: string[] = ['El', 'Elhandel', 'Elproduktion', 'Fjärrvärme', 'Fjärrkyla'];
  return relevantTypes.includes(installation.type);
}

function itemsDelegatedBy(delegation: Delegation, ownerItems: InstalledBaseItem[]): InstalledBaseItem[] {
  const delegatedFacilityIds = new Set(delegation.facilities.map(f => f.id));

  return ownerItems
    .filter(facilityActiveLastThreeYears)
    .filter(i => delegatedFacilityIds.has(i.facilityId))
    .map(item => ({ ...item, isDelegated: true, facilityOwnerPartyId: delegation.owner }));
}

@Controller()
export class UserController {
  @Get('/me')
  @OpenAPI({ summary: 'Return current user' })
  async getUser(@Req() req: RequestWithUser, @Res() response: any): Promise<UserData> {
    const { name, permissions } = req.user;
    const representing = req.session?.representing ?? undefined;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    req.session.cache ??= {};
    req.cache ??= {};

    if (hasRepresentingContext(req)) {
      await sessionCacheService.cacheRelations(req);
    }

    if (
      representing &&
      getRepresentingPartyId(representing) &&
      (req.session.cache?.partyId !== getRepresentingPartyId(representing) || !req.session.cache.addresses)
    ) {
      req.session.cache.partyId = getRepresentingPartyId(representing);
      const relations = req.session.cache?.relations?.customerRelations ?? [];
      const addressDictionary: { [key: string]: string[] } = {};

      // Own facilities: one request for the represented party across all related organizations
      const customerItemsPromise = fetchInstalledBase(
        getRepresentingPartyId(representing),
        relations.map(r => r.organizationNumber).filter(Boolean),
        req.user,
      )
        .then(items => items.filter(facilityActiveLastThreeYears).filter(relevantType))
        .catch(error => {
          logger.error('Could not fetch installed base', error);
          return [] as InstalledBaseItem[];
        });

      // Delegated facilities: one request per delegation owner across the organizations delegated from them
      const delegations = req.session.cache.delegations ?? [];
      const orgIdsByOwner = new Map<string, Set<string>>();
      let delegatedFacilityCount = 0;
      delegations.forEach(delegation => {
        if (!orgIdsByOwner.has(delegation.owner)) orgIdsByOwner.set(delegation.owner, new Set());
        delegation.facilities.forEach(facility => {
          delegatedFacilityCount += 1;
          orgIdsByOwner.get(delegation.owner).add(facility.businessEngagementOrgId);
        });
      });
      const itemsByOwner = new Map<string, Promise<InstalledBaseItem[]>>();
      orgIdsByOwner.forEach((orgIds, owner) => {
        itemsByOwner.set(owner, fetchInstalledBase(owner, Array.from(orgIds), req.user));
      });
      logger.info(
        `ME_FANOUT sid=${getSessionMarker()} relations=${relations.length} delegated_facilities=${delegatedFacilityCount} delegated_unique_owners=${itemsByOwner.size}`,
      );

      const delegatedResults = await Promise.allSettled(
        delegations.map(delegation =>
          itemsByOwner.get(delegation.owner).then(ownerItems => itemsDelegatedBy(delegation, ownerItems)),
        ),
      );
      delegatedResults
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .forEach(r => logger.error('Could not fetch delegated installed base', r.reason));
      const delegatedItems = delegatedResults
        .filter((r): r is PromiseFulfilledResult<InstalledBaseItem[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // Each group is deduplicated on its own, as before: a facility both owned and delegated is listed in both
      const facilities: InstalledBaseItem[] = [
        ...uniqueFacilities(await customerItemsPromise),
        ...uniqueFacilities(delegatedItems),
      ];

      for (const installation of facilities) {
        const {
          address: { street },
          facilityId,
        } = installation;
        if (
          installation.metaData?.some(
            (data: InstalledBaseItemMetaData) =>
              (data.key.includes('isproduction') || data.key.includes('issmallproduction')) &&
              data.value.includes('true'),
          )
        ) {
          if (installation.type === 'El') {
            installation.type = 'Elproduktion';
          }
          installation.address.street = street.replace(/\s*([Ss]ol[cs]ellsanläggning).*$/g, '');
        }
        const addressKey = street.replace(/\s*([Ss]ol[cs]ellsanläggning).*$/g, '');

        if (!addressDictionary[addressKey]) addressDictionary[addressKey] = [];

        if (!addressDictionary[addressKey].includes(facilityId)) addressDictionary[addressKey].push(facilityId);
      }
      req.session.cache.addresses = Object.entries(addressDictionary).map(([k, v]) => ({ address: k, facilityIds: v }));
      req.session.cache.facilities = facilities;
    }

    const relations = req.session.cache.relations;
    const facilities = [...(req.session.cache.facilities ?? [])].sort((a, b) =>
      (a.address?.street ?? '').localeCompare(b.address?.street ?? ''),
    );
    const addresses = [...(req.session.cache.addresses ?? [])].sort((a, b) => a.address.localeCompare(b.address));

    const userData: UserData = {
      name,
      relations,
      addresses,
      facilities,
      extendedView: permissions.canImpersonateUser,
      isExtendingView: permissions.isImpersonatingUser,
    };

    return response.send({ data: userData, message: 'success' });
  }

  @Get('/myrelations')
  @OpenAPI({ summary: 'Return current users relations' })
  async getUserRelations(@Req() req: RequestWithUser, @Res() response: any): Promise<CustomerRelation[]> {
    const { name } = req.user;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    req.session.cache ??= {};
    req.cache ??= {};

    await sessionCacheService.cacheRelations(req);

    const relations = req.session.cache.relations.customerRelations;

    return response.send({ data: relations, message: 'success' });
  }
}
