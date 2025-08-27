import { ENVIRONMENT, MOCK_ORGANIZATION_ID, MOCK_ORGANIZATION_NAME, MOCK_ORGANIZATION_NUMBER, MUNICIPALITY_ID } from '@/config';
import { BusinessEngagementsResponse, BusinessEngagementsResponseStatusEnum } from '@/data-contracts/businessengagements/data-contracts';
import ApiService from './api.service';
import { getApiBase } from '@/config/api-config';

const getBusinessEngagements = async (partyId, name) => {
  if (!partyId) {
    throw new Error('Bad Request: partyId is required');
  }
  const apiBase = getApiBase('businessengagements');
  const url = `${apiBase}/${MUNICIPALITY_ID}/engagements/${partyId}`;
  const params = {
    personalName: name,
    serviceName: 'Mina Sidor',
  };

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
    res = await apiService.get<BusinessEngagementsResponse>({ url, params }, { username: 'unknown' });
  }
  // req.session.representingBusinessChoices = res.data.engagements;
  return res.data.engagements ?? [];
};

export default getBusinessEngagements;
