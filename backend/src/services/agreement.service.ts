import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Agreement, AgreementParameters, PagedAgreementResponse } from '@/data-contracts/agreement/data-contracts';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import ApiService from './api.service';
import dayjs from 'dayjs';
import { PagedAgreementsResult } from '@/interfaces/agreements.interface';

function activeAgreement(agreement: Agreement): boolean {
  // Agreements are considered active if the `toDate` is in the future or undefined (ongoing agreements).
  return dayjs(agreement.toDate).isAfter(dayjs()) || agreement.toDate === undefined;
}

async function fetchAllAgreementPages(
  apiService: ApiService,
  url: string,
  user: { username: string },
): Promise<Agreement[]> {
  const allAgreements: Agreement[] = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages; page++) {
    const params: AgreementParameters = { limit: 1000, page };
    const res = await apiService.get<PagedAgreementResponse>({ url, params }, user);
    allAgreements.push(...(res.data.agreements ?? []));
    totalPages = res.data._meta?.totalPages ?? 1;
  }

  return allAgreements;
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
  const filteredAgreements: Agreement[] = [];
  const agreements: Agreement[] = [];

  const mainUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
  let mainAgreements = await fetchAllAgreementPages(apiService, mainUrl, user);
  if (!includeInactiveAgreements) {
    mainAgreements = mainAgreements.filter(activeAgreement);
  }
  filteredAgreements.push(...mainAgreements);

  for (const partyId of partyIdList) {
    const delegationUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
    const allDelegationAgreements = await fetchAllAgreementPages(apiService, delegationUrl, user);
    const delegationAgreements = includeInactiveAgreements
      ? allDelegationAgreements
      : allDelegationAgreements.filter(activeAgreement);

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

export const fetchPagedAgreements = async (
  partyId: string,
  partyIdList: string[],
  delegations: Delegation[],
  user: { username: string },
  page: number,
  limit: number,
): Promise<PagedAgreementsResult> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('agreement');

  const mainUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
  const params: AgreementParameters = { limit, page };
  const res = await apiService.get<PagedAgreementResponse>({ url: mainUrl, params }, user);

  let agreements = (res.data.agreements ?? []).filter(activeAgreement);

  if (page === 1) {
    const delegationAgreements: Agreement[] = [];

    for (const delegationPartyId of partyIdList) {
      const delegationUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${delegationPartyId}`;
      const allDelegationAgreements = await fetchAllAgreementPages(apiService, delegationUrl, user);
      delegationAgreements.push(...allDelegationAgreements.filter(activeAgreement));
    }

    const matchedDelegationAgreements = delegationAgreements.filter(agreement =>
      delegations.some(delegation => delegation.facilities.some(facility => facility.id === agreement.facilityId)),
    );

    agreements = [...agreements, ...matchedDelegationAgreements];
  }

  return {
    agreements,
    _meta: res.data._meta ?? { page, limit, totalPages: 1 },
  };
};
