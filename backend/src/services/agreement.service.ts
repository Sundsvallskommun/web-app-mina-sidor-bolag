import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Agreement, PagedAgreementResponse } from '@/data-contracts/agreement/data-contracts';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import ApiService from './api.service';
import dayjs from 'dayjs';

function activeAgreement(agreement: Agreement): boolean {
  // Agreements are considered active if the `toDate` is in the future or undefined (ongoing agreements).
  return dayjs(agreement.toDate).isAfter(dayjs()) || agreement.toDate === undefined;
}

export const fetchAgreementsForPartyAndDelegations = async (
  partyId: string,
  partyIdList: string[],
  delegations: Delegation[],
  user: { username: string },
  includeInactiveAgreements: boolean = false,
): Promise<Agreement[]> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('agreement');
  const url = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
  const params = {};
  const filteredAgreements: Agreement[] = [];
  const agreements: Agreement[] = [];

  // Fetch agreements for the main party
  const res = await apiService.get<PagedAgreementResponse>({ url, params }, user);
  let mainAgreements = res.data.agreements;
  if (!includeInactiveAgreements) {
    mainAgreements = mainAgreements.filter(activeAgreement);
  }
  filteredAgreements.push(...mainAgreements);

  // Fetch agreements for delegated parties
  for (const partyIdItem of partyIdList) {
    const delegationUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyIdItem}`;
    const delegationRes = await apiService.get<PagedAgreementResponse>({ url: delegationUrl, params }, user);
    let delegationAgreements = delegationRes.data.agreements;
    if (!includeInactiveAgreements) {
      delegationAgreements = delegationAgreements.filter(activeAgreement);
    }
    agreements.push(...delegationAgreements);
  }

  // Filter delegated agreements by delegation facilities
  agreements.forEach(agreement => {
    delegations.forEach(delegation => {
      delegation.facilities.forEach(facility => {
        if (facility.id === agreement.facilityId) {
          filteredAgreements.push(agreement);
        }
      });
    });
  });

  return filteredAgreements;
};
