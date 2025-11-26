import { ENVIRONMENT, MOCK_ORGANIZATION_NAME, MOCK_ORGANIZATION_NUMBER, MUNICIPALITY_ID, NAMESPACE } from '@/config';
import { getApiBase } from '@/config/api-config';
import { LegalEntity2, PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { BusinessInformation } from '@/interfaces/business-engagement';
import { User } from '@/interfaces/users.interface';
import ApiService from './api.service';
import { Mandates } from '@/data-contracts/myrepresentatives/data-contracts';
import { logger } from '@/utils/logger';

export const getBusinessEngagements = async (user: User): Promise<PersonEngagement[]> => {
  if (!user.personNumber) {
    throw new Error('Bad Request: personalNumber is required');
  }
  const apiBase = getApiBase('legalentity');
  const apiService = new ApiService();
  const url = `${apiBase}/${MUNICIPALITY_ID}/engagements/person/${user.personNumber}`;

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
    try {
      res = await apiService.get<PersonEngagement[]>({ url }, { username: 'unknown' });
    } catch (error) {
      logger.error('Could not get engagements', error);
      res = { data: [] };
    }
  }

  await addEngagementFromMandate(user, apiService, apiBase, res);

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

const addEngagementFromMandate = async (
  user: User,
  apiService: ApiService,
  apiBase: string,
  res: {
    data: PersonEngagement[];
  },
) => {
  const mandateApiUrl = `${getApiBase('myrepresentatives')}/${MUNICIPALITY_ID}/${NAMESPACE}/mandates`;
  const mandateParams = {
    granteePartyId: user.partyId,
  };

  const mandateRes = await apiService.get<Mandates>({ url: mandateApiUrl, params: mandateParams }, user);

  if (mandateRes && mandateRes.data.mandateDetailsList.length > 0) {
    await Promise.all(
      mandateRes.data.mandateDetailsList.map(async m => {
        const url = `${apiBase}/${MUNICIPALITY_ID}/${m.grantorDetails.grantorPartyId}`;
        const companyByGrantor = await apiService.get<LegalEntity2>({ url }, user);

        res.data.push({
          organizationNumber: companyByGrantor.data.organizationNumber,
          name: companyByGrantor.data.name,
          isAuthorizedSignatory: false,
          isSoleTrader: null,
        });
      }),
    );
  }
};
