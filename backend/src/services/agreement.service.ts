import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Agreement, PagedAgreementResponse } from '@/data-contracts/agreement/data-contracts';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import { AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';
import ApiService from './api.service';

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
  params: AxiosRequestConfig['params'] = {},
): Promise<Agreement[]> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('agreement');
  const url = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
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
    const { data: delegationData } = await apiService.get<PagedAgreementResponse>({ url: delegationUrl, params }, user);
    const delegationAgreements = includeInactiveAgreements
      ? delegationData.agreements
      : delegationData.agreements.filter(activeAgreement);

    agreements.push(...delegationAgreements);
  }

  // Filter delegated agreements by delegation facilities
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
