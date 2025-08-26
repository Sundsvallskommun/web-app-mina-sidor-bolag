import { getApiBase } from '@/config/api-config';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { deleteContactSetting, getContactSettingChannels, makeClientContactSetting } from '@/services/contact-setting.service';
import { apiURL } from '@/utils/util';
import authMiddleware from '@middlewares/auth.middleware';
import _ from 'lodash';
import { Body, Controller, Delete, Get, HttpCode, OnUndefined, Param, Patch, Post, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { MUNICIPALITY_ID } from '../config';
import { ContactSetting, NewContactSettings, UpdateContactSettings } from '../interfaces/contact-settings';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ApiResponse, ResponseData } from '../interfaces/service';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { ClientContactSetting } from '../responses/contactsettings.response';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';
import { getBusinessAddress, getBusinessName } from './contact-settings/utils';

@Controller()
export class ContactSettingsController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('contactsettings');

  @Get('/contactsettings')
  @OpenAPI({ summary: 'Return a list of contact settings' })
  @ResponseSchema(ClientContactSetting)
  @UseBefore(authMiddleware)
  async getContactSettings(
    @Req() req: RequestWithUser,
    @QueryParam('limit', { required: false }) limit?: number,
    @QueryParam('page', { required: false }) page?: number,
  ): Promise<ResponseData<ClientContactSetting>> {
    const cache = req?.session?.cache;
    const representing = cache?.representing ?? undefined;
    const { user } = req;

    if (!getRepresentingPartyId(representing)) {
      throw new HttpException(403, 'Forbidden');
    }

    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings`;
    const params = {
      partyId: getRepresentingPartyId(representing),
      page: page ?? 1,
      limit: limit ?? 100, // NOTE: 100 is max it seems
    };

    let res: ApiResponse<Array<ContactSetting>>;
    try {
      res = await this.apiService.get<Array<ContactSetting>>({ url, params }, req.user);
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
      throw new HttpException(404, 'Not Found');
    }

    const clientContactSetting = makeClientContactSetting(res?.data?.[0]);

    switch (representing.mode) {
      case RepresentingMode.BUSINESS:
        clientContactSetting.name = getBusinessName(representing);
        clientContactSetting.address = getBusinessAddress(representing);
        break;
      case RepresentingMode.PRIVATE:
        {
          clientContactSetting.name = user.name;
          const apiBase = getApiBase('citizen');
          const url = `${apiBase}/${MUNICIPALITY_ID}/${user.partyId}`;
          const params = {
            ShowClassified: false,
          };
          const citizenRes = await this.apiService.get<CitizenExtended>({ url, params }, req.user);
          if (citizenRes.data) {
            const address = citizenRes.data.addresses?.[0];
            clientContactSetting.address = address?.city
              ? {
                  city: address.city,
                  street: !address.addressArea || !address.addressNumber ? undefined : `${address.addressArea} ${address.addressNumber}`,
                  postcode: address.postalCode,
                }
              : null;
          }
        }
        break;
      default:
      //
    }
    return { data: clientContactSetting, message: 'success' };
  }

  @Post('/contactsettings')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create contact settings for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientContactSetting, 'body'))
  async newContactSettings(@Req() req: RequestWithUser, @Body() userData: ClientContactSetting): Promise<ResponseData<ClientContactSetting>> {
    const cache = req?.session?.cache;
    const representing = cache?.representing ?? undefined;
    const newContactSettings: NewContactSettings = {
      alias: userData.alias ?? 'default',
      virtual: userData.virtual ?? false,
      partyId: userData.createdById ? undefined : getRepresentingPartyId(representing),
      createdById: userData.createdById ?? req.user.partyId,
      contactChannels: getContactSettingChannels(userData),
    };
    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/settings`;
    const res = await this.apiService.post<ClientContactSetting, NewContactSettings>({ url, baseURL, data: newContactSettings }, req.user);

    const data: ClientContactSetting = _.merge(userData, {
      id: res.data?.id,
    });

    return { data: data, message: 'created' };
  }

  @Patch('/contactsettings')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update contact settings for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientContactSetting, 'body'))
  async editContactSettings(@Req() req: RequestWithUser, @Body() userData: ClientContactSetting): Promise<ResponseData<ClientContactSetting>> {
    if (!userData.id) {
      throw new HttpException(400, 'Bad Request');
    }
    const editedContactSettings: UpdateContactSettings = { alias: userData.alias, contactChannels: getContactSettingChannels(userData) };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${userData.id}`;
    const res = await this.apiService.patch<ClientContactSetting, UpdateContactSettings>({ url, data: editedContactSettings }, req.user);

    const data = _.merge(userData, {
      id: res.data?.id,
    });

    return { data: data, message: 'updated' };
  }

  @Delete('/contactsettings/:contactSettingId')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Delete contact setting for current logged in user' })
  @UseBefore(authMiddleware)
  async _deleteContactSetting(@Req() req: RequestWithUser, @Param('contactSettingId') contactSettingId: string): Promise<ResponseData<boolean>> {
    if (!contactSettingId) {
      throw new HttpException(400, 'Bad Request');
    }
    const deletionOk = await deleteContactSetting(contactSettingId, req);
    if (!deletionOk) {
      throw new HttpException(500, 'Internal Server Error');
    }
    return { data: deletionOk, message: 'Deleted contact setting' };
  }
}
