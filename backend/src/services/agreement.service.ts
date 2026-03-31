import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Agreement, AgreementParameters, PagedAgreementResponse } from '@/data-contracts/agreement/data-contracts';
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
  const params: AgreementParameters = { limit: 1000, page: 1 };
  const filteredAgreements: Agreement[] = [];
  const agreements: Agreement[] = [];

  const res = await apiService.get<PagedAgreementResponse>({ url, params }, user);
  let mainAgreements = res.data.agreements;
  if (!includeInactiveAgreements) {
    mainAgreements = mainAgreements.filter(activeAgreement);
  }
  filteredAgreements.push(...mainAgreements);

  for (const partyId of partyIdList) {
    const delegationUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
    const { data: delegationData } = await apiService.get<PagedAgreementResponse>({ url: delegationUrl, params }, user);
    const delegationAgreements = includeInactiveAgreements
      ? delegationData.agreements
      : delegationData.agreements.filter(activeAgreement);

    agreements.push(...delegationAgreements);
  }

  agreements.forEach(agreement => {
    const hasMatch = delegations.some(delegation => {
      return delegation.facilities.some(facility => facility.id === agreement.facilityId);
    });
    if (hasMatch) {
      filteredAgreements.push(agreement);
    }
  });

  return filteredAgreements;
};
