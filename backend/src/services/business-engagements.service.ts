import { ENVIRONMENT, MOCK_ORGANIZATION_NAME, MOCK_ORGANIZATION_NUMBER, MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { BusinessInformation } from '@/interfaces/business-engagement';
import { User } from '@/interfaces/users.interface';
import ApiService from './api.service';

export const getBusinessEngagements = async (personalNumber: string): Promise<PersonEngagement[]> => {
  if (!personalNumber) {
    throw new Error('Bad Request: personalNumber is required');
  }
  const apiBase = getApiBase('legalentity');
  const url = `${apiBase}/${MUNICIPALITY_ID}/engagements/person/${personalNumber}`;

  let res: { data: PersonEngagement[] };
  if (ENVIRONMENT === 'TEST' && MOCK_ORGANIZATION_NAME && MOCK_ORGANIZATION_NUMBER) {
    res = {
      data: [
        {
          organizationNumber: MOCK_ORGANIZATION_NUMBER,
          name: MOCK_ORGANIZATION_NAME,
          form: 'Aktiebolag',
          formShort: 'AB',
          roles: [
            {
              description: 'Styrelseledamot',
              code: 'LE',
            },
          ],
          isAuthorizedSignatory: true,
          isSoleTrader: null,
          source: 'Bolagsverket',
        },
      ],
    };
  } else {
    const apiService = new ApiService();
    res = await apiService.get<PersonEngagement[]>({ url }, { username: 'unknown' });
  }
  return res.data ?? [];
};

export const getBusinessInformation = async (
  engagement: PersonEngagement,
  user: User,
): Promise<BusinessInformation> => {
  const apiBase = getApiBase('legalentity');
  const apiService = new ApiService();
  if (!engagement) {
    throw new HttpException(500, 'Internal Server Error - Does not exists');
  }

  if (!engagement.organizationNumber) {
    throw new HttpException(500, 'Internal Server Error - Data not complete');
  }

  const guidurl = `${apiBase}/${MUNICIPALITY_ID}/${engagement.organizationNumber}/guid`;
  const guid = await apiService.get<string>({ url: guidurl }, user);

  const url = `${apiBase}/${MUNICIPALITY_ID}/${guid.data}`;

  const details = await apiService.get<LegalEntity2>({ url }, user);

  if (!details.data) {
    throw new HttpException(404, 'Not Found');
  }
  const { address } = details.data;

  return { address, partyId: guid.data };
};

export default getBusinessEngagements;
