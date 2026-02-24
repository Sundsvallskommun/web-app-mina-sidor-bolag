import { Controller, Body, Req, Get, UseBefore, Res, Patch, OnUndefined } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import prisma from '@utils/prisma';
import { IsIn } from 'class-validator';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { getApiBase } from '@/config/api-config';
import { MUNICIPALITY_ID } from '@/config';
import ApiService from '@/services/api.service';
import { Customer, CustomerRelation } from '@/data-contracts/customer/data-contracts';
import {
  Delegation,
  InstalledBaseItem,
  InstalledBaseItemMetaData,
  InstalledBaseResponse,
} from '@/data-contracts/installedbase/data-contracts';
import { FacilityAddress } from '@/interfaces/facility-address.interface';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import dayjs from 'dayjs';
import { startAISession } from '@/services/selfserviceai.service';

interface UserData {
  name: string;
  userSettings: any;
  relations?: { customerNumber: string[]; customerRelations: CustomerRelation[] };
  addresses?: FacilityAddress[];
  facilities?: InstalledBaseItem[];
  delegations?: Delegation[];
}

export class PatchUserSettingsDto {
  @IsIn(['untilRemoved', 'oneMonth', 'twoWeeks'])
  feedbackLifespan: string;
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
  const relevantTypes: string[] = ['El', 'Elhandel', 'Elproduktion', 'Fjärrvärme'];
  return relevantTypes.includes(installation.type);
}

@Controller()
export class UserController {
  private apiService = new ApiService();
  private customerApiBase = getApiBase('customer');
  private installedBaseApiBase = getApiBase('installedbase');

  cacheRelations = async (req: RequestWithUser) => {
    const delegations = req?.session?.cache?.delegations ?? [];
    const allRelations: CustomerRelation[] = [];

    if (!req.session.cache.relations) {
      try {
        const relationsUrl = `${this.customerApiBase}/${MUNICIPALITY_ID}/relations/${req.user.partyId}`;
        const relationsRes = await this.apiService.get<Customer>({ url: relationsUrl }, req.user);
        const relations = relationsRes.data?.customerRelations ?? [];

        relations.forEach(relation =>
          allRelations.push({
            ...relation,
            organizationName: relation.organizationName.replace(/\s*(AB)\s*$/g, ''),
          }),
        );
      } catch (error) {
        if (error.status === 500) {
          throw new HttpException(500, 'Could not fetch customer relations');
        }
      }

      if (delegations.length) {
        try {
          for (const delegation of delegations) {
            const relationsUrl = `${this.customerApiBase}/${MUNICIPALITY_ID}/relations/${delegation.owner}`;
            const relationsRes = await this.apiService.get<Customer>({ url: relationsUrl }, req.user);

            const relations = relationsRes.data?.customerRelations ?? [];
            relations.forEach(relation => {
              if (!allRelations.some(r => r.organizationNumber === relation.organizationNumber)) {
                allRelations.push({
                  customerNumber: relation.customerNumber,
                  organizationNumber: relation.organizationNumber,
                  organizationName: relation.organizationName.replace(/\s*(AB)\s*$/g, ''),
                });
              }
            });
          }
        } catch (error) {
          if (error.status === 500) {
            throw new HttpException(500, 'Could not fetch customer relations');
          }
        }
      }

      const customerNumbers: string[] = [];

      allRelations.forEach(relation => {
        if (!customerNumbers.includes(relation.customerNumber)) customerNumbers.push(relation.customerNumber);
      });

      req.session.cache.relations = {
        customerRelations: allRelations,
        customerNumber: customerNumbers,
      };
      return Promise.resolve(true);
    }
  };

  @Get('/me')
  @OpenAPI({ summary: 'Return current user' })
  @UseBefore(authMiddleware)
  async getUser(@Req() req: RequestWithUser, @Res() response: any): Promise<UserData> {
    const { name } = req.user;
    const representing = req.session?.representing ?? undefined;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    let userSettings = await prisma.userSettings.findFirst({
      where: {
        userId: req.user.partyId,
      },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: req.user.partyId,
          feedbackLifespan: 'oneMonth',
          readNotificationsClearedDate: new Date().toISOString(),
        },
      });
    }

    if (userSettings) {
      delete userSettings.id;
      delete userSettings.userId;
    }

    req.session.cache ??= {};
    req.cache ??= {};

    await this.cacheRelations(req);

    if (!req.session?.ai?.sessionId) {
      await startAISession(req);
    }

    if (
      representing &&
      getRepresentingPartyId(representing) &&
      (req.session.cache?.partyId !== getRepresentingPartyId(representing) || !req.session.cache.addresses)
    ) {
      req.session.cache.partyId = getRepresentingPartyId(representing);
      const relations = req.session.cache?.relations?.customerRelations ?? [];
      const facilities: InstalledBaseItem[] = [];
      const addressDictionary: { [key: string]: string[] } = {};
      let customerItems: InstalledBaseItem[] = [];
      const installedBasePromises = [];
      const delegatedInstalledBasePromises = [];
      let delegatedItems: InstalledBaseItem[] = [];

      for (const { organizationNumber } of relations) {
        try {
          const installedBaseUrl = `${this.installedBaseApiBase}/${MUNICIPALITY_ID}/installedbase/${organizationNumber}`;
          const installedBaseParams = {
            partyId: getRepresentingPartyId(representing),
          };
          const thisPromise = this.apiService
            .get<InstalledBaseResponse>({ url: installedBaseUrl, params: installedBaseParams }, req.user)
            .then(res => {
              const installedBaseRes: InstalledBaseResponse = res.data;
              const customer = installedBaseRes.installedBaseCustomers[0];
              return customer.items.filter(facilityActiveLastThreeYears).filter(relevantType);
            });
          installedBasePromises.push(thisPromise);
        } catch (error) {
          // Handle 404 as empty
          if (error.status === 404) {
            installedBasePromises.push(Promise.resolve([]));
          } else {
            throw new HttpException(500, 'Could not fetch installedbases');
          }
        }
      }
      await Promise.allSettled(installedBasePromises)
        .then(results => {
          customerItems = results
            .filter(r => r.status === 'fulfilled')
            .map((r: PromiseFulfilledResult<any>) => r.value)
            .flat();
        })
        .catch(() => {
          customerItems = [];
        });

      // Fetch complete facility information for delegated facilities
      const delegations = req.session.cache.delegations;
      delegations.forEach(delegation => {
        delegation.facilities.forEach(facility => {
          try {
            const installedBaseUrl = `${this.installedBaseApiBase}/${MUNICIPALITY_ID}/installedbase/${facility.businessEngagementOrgId}`;
            const installedBaseParams = {
              partyId: delegation.owner,
            };
            const thisPromise = this.apiService
              .get<InstalledBaseResponse>({ url: installedBaseUrl, params: installedBaseParams }, req.user)
              .then(res => {
                const installedBaseRes: InstalledBaseResponse = res.data;
                const customer = installedBaseRes.installedBaseCustomers[0];

                return customer.items
                  .filter(facilityActiveLastThreeYears)
                  .filter(i => delegation.facilities.map(f => f.id).includes(i.facilityId))
                  .map(item => {
                    return { ...item, isDelegated: true, facilityOwnerPartyId: customer.partyId };
                  });
              });
            delegatedInstalledBasePromises.push(thisPromise);
          } catch (error) {
            // Handle 404 as empty
            if (error.status === 404) {
              delegatedInstalledBasePromises.push(Promise.resolve([]));
            } else {
              throw new HttpException(500, 'Could not fetch installedbases');
            }
          }
        });
      });
      await Promise.allSettled(delegatedInstalledBasePromises)
        .then(results => {
          delegatedItems = results
            .filter(r => r.status === 'fulfilled')
            .map((r: PromiseFulfilledResult<any>) => r.value)
            .flat();
        })
        .catch(error => {
          console.log('Error in delegated installed base promises', error);
          delegatedItems = [];
        });

      const uniqueFacilities: InstalledBaseItem[] = delegatedItems.reduce((accumulator, current) => {
        if (
          !accumulator.some(
            (item: InstalledBaseItem) => item.facilityId === current.facilityId && item.type === current.type,
          )
        ) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);

      facilities.push(...customerItems, ...uniqueFacilities);

      for (const installation of facilities) {
        const {
          address: { street },
          facilityId,
        } = installation;
        if (
          installation.metaData.some(
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
    const facilities = req.session.cache.facilities;
    const addresses = req.session.cache.addresses;

    const userData: UserData = {
      userSettings,
      name,
      relations,
      addresses,
      facilities,
    };

    return response.send({ data: userData, message: 'success' });
  }

  @Get('/myrelations')
  @OpenAPI({ summary: 'Return current users relations' })
  @UseBefore(authMiddleware)
  async getUserRelations(@Req() req: RequestWithUser, @Res() response: any): Promise<CustomerRelation[]> {
    const { name } = req.user;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    req.session.cache ??= {};
    req.cache ??= {};

    await this.cacheRelations(req);

    const relations = req.session.cache.relations.customerRelations;

    return response.send({ data: relations, message: 'success' });
  }

  @Patch('/settings')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Patch user settings' })
  @UseBefore(authMiddleware, validationMiddleware(PatchUserSettingsDto, 'body'))
  async patchSettings(@Req() req: RequestWithUser, @Body() userData: PatchUserSettingsDto): Promise<void> {
    const { partyId } = req.user;

    const newSettings = await prisma.userSettings.update({
      where: {
        userId: partyId,
      },
      data: userData,
    });

    if (newSettings) {
      delete newSettings.id;
      delete newSettings.userId;
    }
  }
}
