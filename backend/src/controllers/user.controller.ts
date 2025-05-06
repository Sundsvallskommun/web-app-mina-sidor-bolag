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
import { InstalledBaseResponse } from '@/data-contracts/installedbase/data-contracts';
import { FacilityAddress } from '@/interfaces/facility-address.interface';
interface UserData {
  name: string;
  userSettings: any;
  relations?: CustomerRelation[];
  addresses?: FacilityAddress[];
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

  @Get('/me')
  @OpenAPI({ summary: 'Return current user' })
  @UseBefore(authMiddleware)
  async getUser(@Req() req: RequestWithUser, @Res() response: any): Promise<UserData> {
    const { name } = req.user;

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

    userSettings && delete userSettings.id;
    userSettings && delete userSettings.userId;

    if (!req.cache) {
      req.cache = {};
    }

    if (!req.cache.relations) {
      const relationsUrl = `${this.customerApiBase}/${MUNICIPALITY_ID}/relations/${req.user.partyId}`;
      const relationsRes = await this.apiService.get<Customer>({ url: relationsUrl }, req);
      req.cache.relations = relationsRes?.data?.customerRelations ?? [];
    }

    if (!req.cache.addresses) {
      const addressDictionary: {[key: string]: string[]} = {};
      for (const {organizationNumber} of req.cache.relations) {
        const installedBaseUrl = `${this.installedBaseApiBase}/${MUNICIPALITY_ID}/installedbase/${organizationNumber}`;
        const installedBaseParams = {
          partyId: req.user.partyId,
        };
        const installedBaseRes = await this.apiService.get<InstalledBaseResponse>({ url: installedBaseUrl, params: installedBaseParams }, req);
        const customer = installedBaseRes.data.installedBaseCustomers[0];

        for (const installation of customer.items) {
          const {address: { street }, facilityId} = installation;
          const addressKey = street; //.replace(' Solcellsanläggning', '');

          if (!addressDictionary[addressKey])
            addressDictionary[addressKey] = [];

          if (!addressDictionary[addressKey].includes(facilityId))
            addressDictionary[addressKey].push(facilityId);
        }
      }
      req.cache.addresses = Object.entries(addressDictionary).map(([k, v]) => ({address: k, facilityIds: v}));
    }

    const relations = req.cache.relations;
    const addresses = req.cache.addresses;

    const userData: UserData = {
      userSettings,
      name,
      relations,
      addresses,
    };

    return response.send({ data: userData, message: 'success' });
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

    newSettings && delete newSettings.id;
    newSettings && delete newSettings.userId;
  }
}
