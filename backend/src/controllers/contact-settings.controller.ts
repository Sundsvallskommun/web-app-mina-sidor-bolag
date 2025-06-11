import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import _ from 'lodash';
import { Body, Controller, Get, HttpCode, OnUndefined, Param, Patch, Post, QueryParam, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { MUNICIPALITY_ID } from '../config';
import { ContactSetting, ContactSettingChannel, NewContactSettings, UpdateContactSettings } from '../interfaces/contact-settings';
import { RepresentingMode } from '../interfaces/representing.interface';
import { ApiResponse, ResponseData } from '../interfaces/service';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { ClientContactSetting, ClientDelegate, DelegatedContactSetting } from '../responses/contactsettings.response';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';
import { getBusinessAddress, getBusinessName, getEmailSettingsFromChannels, getPhoneSettingsFromChannels } from './contact-settings/utils';
import { ContactMethod } from '@/data-contracts/contactsettings/data-contracts';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { deleteDelegate } from '@/services/contact-setting.service';
import { apiURL } from '@/utils/util';

@Controller()
export class ContactSettingsController {
  private apiService = new ApiService();
  private apiBase = getApiBase('contactsettings');

  getContactSettingChannels = (userData: ClientContactSetting) => {
    const emailSettings: ContactSettingChannel = {
      contactMethod: ContactMethod.EMAIL,
      destination: userData.email,
      disabled: userData.notifications.email_disabled,
      alias: 'default',
    };
    const phoneSettings: ContactSettingChannel = {
      contactMethod: ContactMethod.SMS,
      destination: userData.phone,
      disabled: userData.notifications.phone_disabled,
      alias: 'default',
    };
    return [...(userData.email ? [emailSettings] : []), ...(userData.phone ? [phoneSettings] : [])];
  };

  makeClientContactSetting = (contactSetting: ContactSetting): ClientContactSetting => {
    const emailSettings = getEmailSettingsFromChannels(contactSetting?.contactChannels);
    const phoneSettings = getPhoneSettingsFromChannels(contactSetting?.contactChannels);

    const clientContactSetting: ClientContactSetting = {
      id: contactSetting.id,
      name: null,
      address: null,
      email: emailSettings.email,
      phone: phoneSettings.phone,
      virtual: contactSetting.virtual,
      alias: contactSetting.alias,
      notifications: {
        email_disabled: emailSettings.email_disabled,
        phone_disabled: phoneSettings.phone_disabled,
      },
      decicionsAndDocuments: {
        digitalInbox: true,
        myPages: true,
        snailmail: false,
      },
    };
    return clientContactSetting;
  };

  @Get('/contactsettings')
  @OpenAPI({ summary: 'Return a list of contact settings' })
  @ResponseSchema(ClientContactSetting)
  @UseBefore(authMiddleware)
  async getContactSettings(
    @Req() req: RequestWithUser,
    @QueryParam('limit', { required: false }) limit?: number,
    @QueryParam('page', { required: false }) page?: number,
  ): Promise<ResponseData<ClientContactSetting>> {
    const { representing } = req?.session ?? {};
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
    console.log('getContactSettings', { url, params });

    let res: ApiResponse<Array<ContactSetting>>;
    try {
      res = await this.apiService.get<Array<ContactSetting>>({ url, params }, req.user);
    } catch (err) {
      // 404 for no data
      if (err.status !== 404) {
        throw err;
      }
    }

    console.log('res', res);

    const clientContactSetting = this.makeClientContactSetting(res?.data?.[0]);

    switch (representing.mode) {
      case RepresentingMode.BUSINESS:
        clientContactSetting.name = getBusinessName(representing);
        clientContactSetting.address = getBusinessAddress(representing);
        break;
      case RepresentingMode.PRIVATE:
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
    const { representing } = req?.session ?? {};
    const newContactSettings: NewContactSettings = {
      alias: 'default',
      virtual: userData.virtual ?? false,
      partyId: getRepresentingPartyId(representing),
      createdById: req.user.partyId,
      contactChannels: this.getContactSettingChannels(userData),
    };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings`;
    const res = await this.apiService.post<ClientContactSetting, NewContactSettings>({ url, data: newContactSettings }, req.user);

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
    const editedContactSettings: UpdateContactSettings = { alias: userData.alias, contactChannels: this.getContactSettingChannels(userData) };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${userData.id}`;
    const res = await this.apiService.patch<ClientContactSetting, UpdateContactSettings>({ url, data: editedContactSettings }, req.user);

    const data = _.merge(userData, {
      id: res.data?.id,
    });

    return { data: data, message: 'updated' };
  }

  @Get('/delegates/:contactSettingId')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Get delegates for given contact setting id' })
  @ResponseSchema(DelegatedContactSetting)
  @UseBefore(authMiddleware)
  async getDelegates(
    @Req() req: RequestWithUser,
    @Param('contactSettingId') contactSettingId: string,
  ): Promise<ResponseData<DelegatedContactSetting>> {
    const params = { principalId: contactSettingId };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/delegates`;
    console.log('getDelegates', { url, params });
    const delegateRes = await this.apiService.get<ClientDelegate[]>({ url, params }, req.user);
    if (!delegateRes?.data) {
      throw new HttpException(404, 'Not Found');
    }
    console.log('delegateRes', delegateRes.data);
    const agentId = delegateRes.data?.[0]?.agentId;
    if (!agentId) {
      throw new HttpException(404, 'Not Found');
    }
    console.log('agentId', agentId);
    const sUrl = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${agentId}`;

    let res: ApiResponse<ContactSetting>;
    try {
      res = await this.apiService.get<ContactSetting>({ url: sUrl }, req.user);
    } catch (err) {
      // 404 for no data
      if (err.status !== 404) {
        throw err;
      }
    }

    console.log('res', res);

    const clientContactSettingData = this.makeClientContactSetting(res?.data);
    if (!clientContactSettingData) {
      throw new HttpException(404, 'Not Found');
    }
    console.log('contactSettingData', clientContactSettingData);

    const delegateContactSetting: DelegatedContactSetting = {
      delegate: delegateRes.data[0],
      contactSetting: clientContactSettingData,
    };

    return { data: delegateContactSetting, message: 'ok' };
  }

  @Patch('/contactsettings/delegates')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update delegate for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientDelegate, 'body'))
  async editDelegate(@Req() req: RequestWithUser, @Body() delegateData: ClientDelegate): Promise<ResponseData<ClientDelegate>> {
    console.log('editDelegate', delegateData);
    if (!delegateData.id) {
      throw new HttpException(400, 'Bad Request');
    }
    const deletionOk = await deleteDelegate(delegateData.id, req);
    console.log('deletion', deletionOk);
    if (!deletionOk) {
      throw new HttpException(500, 'Internal Server Error');
    }
    // return { data: delegateData, message: 'fake updated' };
    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegates`;
    delete delegateData.id; // remove id from data to avoid sending it to the API
    delegateData.filters?.forEach(filter => {
      delete filter.id; // remove id from filters to avoid sending it to the API
    });
    const res = await this.apiService.post<ClientDelegate, ClientDelegate>({ url, baseURL, data: delegateData }, req.user);

    console.log('Post response', res);

    const data = _.merge(delegateData, {
      id: res.data?.id,
    });

    return { data: data, message: 'updated' };
  }

  // @Get('/delegatedcontactsettings/:agentId')
  // @OnUndefined(204)
  // @OpenAPI({ summary: 'Get delegated contact setting corresponding to given agent id' })
  // @ResponseSchema(ClientContactSetting)
  // @UseBefore(authMiddleware)
  // async getDelegatedContactSettings(@Req() req: RequestWithUser, @Param('agentId') agentId: string): Promise<ResponseData<ClientContactSetting>> {
  //   const data = await this.fetchContactSettings(req, agentId, 1, 10);
  //   if (!data) {
  //     throw new HttpException(404, 'Not Found');
  //   }

  //   return { data, message: 'ok' };
  // }
}
