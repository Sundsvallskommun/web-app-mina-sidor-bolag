import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { deleteDelegate, makeClientContactSetting } from '@/services/contact-setting.service';
import { apiURL } from '@/utils/util';
import authMiddleware from '@middlewares/auth.middleware';
import _ from 'lodash';
import { Body, Controller, Delete, Get, OnUndefined, Param, Patch, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { MUNICIPALITY_ID } from '../config';
import { ContactSetting } from '../interfaces/contact-settings';
import { ApiResponse, ResponseData } from '../interfaces/service';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { ClientContactSetting, ClientDelegate, DelegatedContactSetting } from '../responses/contactsettings.response';
import { logger } from '@/utils/logger';

@Controller()
export class DelegateController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('contactsettings');

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
    const delegateRes = await this.apiService.get<ClientDelegate[]>({ url, params }, req.user);
    if (!delegateRes?.data) {
      throw new HttpException(404, 'Not Found');
    }

    if (delegateRes.data.length === 0) {
      throw new HttpException(404, 'Not Found');
    }
    const delegatePromises: Promise<{ delegate: ClientDelegate; contactSetting: ClientContactSetting }>[] = delegateRes.data.map(async delegate => {
      const agentId = delegate?.agentId;
      if (!agentId) {
        throw new HttpException(404, 'Not Found');
      }
      const sUrl = `${this.apiBase}/${MUNICIPALITY_ID}/settings/${agentId}`;

      let res: ApiResponse<ContactSetting>;
      try {
        res = await this.apiService.get<ContactSetting>({ url: sUrl }, req.user);
        const clientContactSettingData = makeClientContactSetting(res?.data);
        if (!clientContactSettingData) {
          throw new HttpException(404, 'Not Found');
        }
        return { delegate, contactSetting: clientContactSettingData };
      } catch (err) {
        Promise.reject(new Error(err));
      }
    });

    return Promise.allSettled(delegatePromises)
      .then(results => ({ data: results.filter(r => r.status === 'fulfilled').map(result => result.value), message: 'ok' }))
      .catch(error => {
        logger.error(`Error resolving delegate promises: ${error}`);
        throw new HttpException(500, 'Internal Server Error');
      });
  }

  @Patch('/delegates')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Update delegate for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(ClientDelegate, 'body'))
  async editDelegate(@Req() req: RequestWithUser, @Body() delegateData: ClientDelegate): Promise<ResponseData<ClientDelegate>> {
    if (delegateData.filters?.length === 0) {
      throw new HttpException(471, 'Bad Request: At least one filter is required');
    }
    if (!delegateData.id) {
      throw new HttpException(400, 'Bad Request');
    }
    const deletionOk = await deleteDelegate(delegateData.id, req);
    if (!deletionOk) {
      throw new HttpException(500, 'Internal Server Error');
    }
    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegates`;
    delete delegateData.id;
    delegateData.filters?.forEach(filter => {
      delete filter.id;
    });
    const res = await this.apiService.post<ClientDelegate, ClientDelegate>({ url, baseURL, data: delegateData }, req.user);

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
    if (delegateData.filters?.length === 0) {
      throw new HttpException(471, 'Bad Request: At least one filter is required');
    }
    const baseURL = apiURL(this.apiBase);
    const url = `${MUNICIPALITY_ID}/delegates`;
    const res = await this.apiService.post<ClientDelegate, ClientDelegate>({ url, baseURL, data: delegateData }, req.user);
    console.log('res', res);

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
