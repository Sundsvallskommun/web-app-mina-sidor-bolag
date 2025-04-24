import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { ApiResponse } from '../interfaces/service';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';
import { InstalledBaseResponse } from '@/data-contracts/installedbase/data-contracts';
import { FacilityAddress } from '@/interfaces/facility-address.interface';

const organizationNumbers = [
  '5565027223',
  '5564786647',
];

@Controller()
export class AddressController {
  private apiService = new ApiService();
  private apiBase = getApiBase('installedbase');

  @Get('/addresses')
  @OpenAPI({ summary: 'Return a list of facility addresses for current party' })
  @UseBefore(authMiddleware)
  async getFacilityAddresses(@Req() req: RequestWithUser): Promise<ApiResponse<FacilityAddress[]>> {
    const { representing } = req?.session;

    const partyId = getRepresentingPartyId(representing);
    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const addressDictionary: {[key: string]: string[]} = {};

      for (const organizationNumber of organizationNumbers) {
        const url = `${this.apiBase}/${MUNICIPALITY_ID}/installedbase/${organizationNumber}`;
        const params = {
          partyId,
        };
        const res = await this.apiService.get<InstalledBaseResponse>({ url, params }, req);
        const customer = res.data.installedBaseCustomers[0];

        for (const installation of customer.items) {
          const {address: { street }, facilityId} = installation;
          const addressKey = street.replace(' Solcellsanläggning', ''); // NOTE: Technically same address, just with metadata appended to address field

          if (!addressDictionary[addressKey])
            addressDictionary[addressKey] = [];

          if (!addressDictionary[addressKey].includes(facilityId))
            addressDictionary[addressKey].push(facilityId);
        }
      }

      const data = Object.entries(addressDictionary).map(([k, v]) => ({address: k, facilityIds: v}));

      return { data, message: 'success' };
    }
    catch (error) {
      if (error.status === 404) {
        return { data: [], message: '404 from api, Assumed empty array' };
      } else {
        return { data: [], message: 'error' };
      }
    }
  }
}
