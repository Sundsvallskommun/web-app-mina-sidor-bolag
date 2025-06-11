import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import _ from 'lodash';
import { Body, Controller, Delete, Get, HttpCode, OnUndefined, Param, Patch, Post, QueryParam, Req, UseBefore } from 'routing-controllers';
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
import { deleteContactSetting, deleteDelegate } from '@/services/contact-setting.service';
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
      throw new HttpException(404, 'Not Found');
      // return { data: null, message: 'not found' };
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
    console.log('Creating contact setting with newContactSettings: ', userData);
    const { representing } = req?.session ?? {};
    const newContactSettings: NewContactSettings = {
      alias: userData.alias ?? 'default',
      virtual: userData.virtual ?? false,
      partyId: userData.createdById ? undefined : getRepresentingPartyId(representing),
      createdById: userData.createdById ?? req.user.partyId,
      contactChannels: this.getContactSettingChannels(userData),
    };
    console.log('newContactSettings', newContactSettings);
    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/settings`;
    const res = await this.apiService.post<ClientContactSetting, NewContactSettings>({ url, baseURL, data: newContactSettings }, req.user);
    console.log('Post response', res);

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

  @Get('/delegates/:contactSettingId')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Get delegates for given contact setting id' })
  @ResponseSchema(DelegatedContactSetting)
  @UseBefore(authMiddleware)
  async getDelegates(
    @Req() req: RequestWithUser,
    @Param('contactSettingId') contactSettingId: string,
  ): Promise<ResponseData<DelegatedContactSetting[]>> {
    if (!contactSettingId) {
      return { data: [], message: 'No contact setting id provided' };
    }
    const params = { principalId: contactSettingId };
    const url = `${this.apiBase}/${MUNICIPALITY_ID}/delegates`;
    console.log('getDelegates', { url, params });
    const delegateRes = await this.apiService.get<ClientDelegate[]>({ url, params }, req.user);
    if (!delegateRes?.data) {
      throw new HttpException(404, 'Not Found');
    }
    console.log('delegateRes', delegateRes.data);

    if (delegateRes.data.length === 0) {
      throw new HttpException(404, 'Not Found');
    }
    const delegatePromises: Promise<{ delegate: ClientDelegate; contactSetting: ClientContactSetting }>[] = delegateRes.data.map(async delegate => {
      const agentId = delegate?.agentId;
      if (!agentId) {
        throw new HttpException(404, 'Not Found');
      }
      console.log('agentId', agentId);
      const sUrl = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${agentId}`;

      let res: ApiResponse<ContactSetting>;
      try {
        res = await this.apiService.get<ContactSetting>({ url: sUrl }, req.user);
        const clientContactSettingData = this.makeClientContactSetting(res?.data);
        if (!clientContactSettingData) {
          throw new HttpException(404, 'Not Found');
        }
        return { delegate, contactSetting: clientContactSettingData };
      } catch (err) {
        Promise.reject(err);
      }
    });

    return Promise.allSettled(delegatePromises)
      .then(results => {
        console.log('All delegate promises resolved', results);
        return { data: results.filter(r => r.status === 'fulfilled').map(result => result.value), message: 'ok' };
      })
      .catch(error => {
        console.error('Error resolving delegate promises', error);
        throw new HttpException(500, 'Internal Server Error');
      });

    // const agentId = delegateRes.data?.[0]?.agentId;
    // if (!agentId) {
    //   throw new HttpException(404, 'Not Found');
    // }
    // console.log('agentId', agentId);
    // const sUrl = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${agentId}`;

    // let res: ApiResponse<ContactSetting>;
    // try {
    //   res = await this.apiService.get<ContactSetting>({ url: sUrl }, req.user);
    // } catch (err) {
    //   // 404 for no data
    //   if (err.status !== 404) {
    //     throw err;
    //   }
    // }

    // console.log('res', res);

    // const clientContactSettingData = this.makeClientContactSetting(res?.data);
    // if (!clientContactSettingData) {
    //   throw new HttpException(404, 'Not Found');
    // }
    // console.log('contactSettingData', clientContactSettingData);

    // const delegateContactSetting: DelegatedContactSetting = {
    //   delegate: delegateRes.data[0],
    //   contactSetting: clientContactSettingData,
    // };

    // return { data: delegateContactSetting, message: 'ok' };
  }

  @Patch('/delegates')
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

  @Post('/delegates')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Create delegate for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientDelegate, 'body'))
  async createDelegate(@Req() req: RequestWithUser, @Body() delegateData: ClientDelegate): Promise<ResponseData<ClientDelegate>> {
    console.log('Creating delegate  with delegateData: ', delegateData);
    if (delegateData.filters?.length === 0) {
      throw new HttpException(471, 'Bad Request: At least one filter is required');
    }
    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegates`;
    const res = await this.apiService.post<ClientDelegate, ClientDelegate>({ url, baseURL, data: delegateData }, req.user);

    console.log('Post response', res);

    const data = _.merge(delegateData, {
      id: res.data?.id,
    });

    return { data: data, message: 'updated' };
  }

  @Delete('/delegates/:delegateId')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update delegate for current logged in user' })
  @UseBefore(authMiddleware)
  async _deleteDelegate(@Req() req: RequestWithUser, @Param('delegateId') delegateId: string): Promise<ResponseData<boolean>> {
    if (!delegateId) {
      throw new HttpException(400, 'Bad Request');
    }
    const deletionOk = await deleteDelegate(delegateId, req);
    if (!deletionOk) {
      throw new HttpException(500, 'Internal Server Error');
    }
    return { data: deletionOk, message: 'Deleted delegate' };
  }
}
