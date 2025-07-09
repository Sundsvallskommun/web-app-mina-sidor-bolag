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
import { InstalledBaseItem, InstalledBaseItemMetaData, InstalledBaseResponse } from '@/data-contracts/installedbase/data-contracts';
import { FacilityAddress } from '@/interfaces/facility-address.interface';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';

interface UserData {
  name: string;
  userSettings: any;
  relations?: CustomerRelation[];
  addresses?: FacilityAddress[];
  facilities?: InstalledBaseItem[];
}

export class PatchUserSettingsDto {
  @IsIn(['untilRemoved', 'oneMonth', 'twoWeeks'])
  feedbackLifespan: string;
}

@Controller()
export class UserController {
  private apiService = new ApiService();
  private customerApiBase = getApiBase('customer');
  private installedBaseApiBase = getApiBase('installedbase');

  cacheRelations = async (req: RequestWithUser) => {
    if (!req.session.cache.relations) {
      try {
        const relationsUrl = `${this.customerApiBase}/${MUNICIPALITY_ID}/relations/${req.user.partyId}`;
        const relationsRes = await this.apiService.get<Customer>({ url: relationsUrl }, req.user);
        const relations = relationsRes.data?.customerRelations ?? [];
        req.session.cache.relations = relations.map(relation => ({
          ...relation,
          organizationName: relation.organizationName.replace(/\s*(AB)\s*$/g, ''),
        }));
      } catch (error) {
        // Handle 404 as empty
        if (error.status === 404) {
          req.session.cache.relations = [];
          req.cache.relations = [];
          return Promise.resolve(true);
        } else {
          throw new HttpException(500, 'Could not fetch customer relations');
        }
      }
    }
  };

  @Get('/me')
  @OpenAPI({ summary: 'Return current user' })
  @UseBefore(authMiddleware)
  async getUser(@Req() req: RequestWithUser, @Res() response: any): Promise<UserData> {
    const { name } = req.user;
    const { representing } = req?.session ?? {};

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

    if (representing && (req.session.cache?.partyId !== getRepresentingPartyId(representing) || !req.session.cache.addresses)) {
      req.session.cache.partyId = getRepresentingPartyId(representing);
      const relations = req.session.cache?.relations ?? [];
      const facilities = [];
      const addressDictionary: { [key: string]: string[] } = {};
      let customerItems = [];
      const installedBasePromises = [];
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
              return customer.items;
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
        .catch(error => {
          console.log('Error in installed base promises', error);
          customerItems = [];
        });

      facilities.push(...customerItems);
      for (const installation of customerItems) {
        const {
          address: { street },
          facilityId,
        } = installation;
        if (
          installation.type === 'El' &&
          installation.metaData.some((data: InstalledBaseItemMetaData) => data.key.includes('isproduction') && data.value.includes('true'))
        ) {
          installation.type = 'Elproduktion';
          installation.address.street = street.replace(/\s*([Ss]olcellsanläggning).*$/g, '');
        }
        const addressKey = street.replace(/\s*([Ss]olcellsanläggning).*$/g, '');

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

    const relations = req.session.cache.relations;

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
