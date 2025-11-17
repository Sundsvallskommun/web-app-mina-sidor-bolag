import { ENVIRONMENT, MOCK_ORGANIZATION_ID, MOCK_ORGANIZATION_NAME, MOCK_ORGANIZATION_NUMBER, MUNICIPALITY_ID } from '@/config';
import { BusinessEngagementsResponse, BusinessEngagementsResponseStatusEnum } from '@/data-contracts/businessengagements/data-contracts';
import ApiService from './api.service';
import { getApiBase } from '@/config/api-config';

const getBusinessEngagements = async (personalNumber: string) => {
  if (!personalNumber) {
    throw new Error('Bad Request: personalNumber is required');
  }
  const apiBase = getApiBase('legalentity');
  const url = `${apiBase}/${MUNICIPALITY_ID}/engagements/person/${personalNumber}`;

  let res: { data: BusinessEngagementsResponse };
  if (ENVIRONMENT === 'TEST' && MOCK_ORGANIZATION_NAME && MOCK_ORGANIZATION_NUMBER && MOCK_ORGANIZATION_ID) {
    res = {
      data: {
        engagements: [
          {
            organizationName: MOCK_ORGANIZATION_NAME,
            organizationNumber: MOCK_ORGANIZATION_NUMBER,
            organizationId: MOCK_ORGANIZATION_ID,
          },
        ],
        statusDescriptions: {},
        status: BusinessEngagementsResponseStatusEnum.OK,
      },
    };
  } else {
    const apiService = new ApiService();
    res = await apiService.get<BusinessEngagementsResponse>({ url }, { username: 'unknown' });
  }
  return res.data.engagements ?? [];
};

export default getBusinessEngagements;
