import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  Agreement,
  AgreementParameters,
  Category,
  PagedAgreementResponse,
} from '@/data-contracts/agreement/data-contracts';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import ApiService from './api.service';
import dayjs from 'dayjs';
import { PagedAgreementsResult } from '@/interfaces/agreements.interface';

function activeAgreement(agreement: Agreement): boolean {
  // Agreements are considered active if the `toDate` is in the future or undefined (ongoing agreements).
  return dayjs(agreement.toDate).isAfter(dayjs()) || agreement.toDate === undefined;
}

const repeatedArrayParamsSerializer = { indexes: null };

async function fetchAllAgreementPages(
  apiService: ApiService,
  url: string,
  user: { username: string },
  categories?: Category[],
): Promise<Agreement[]> {
  const allAgreements: Agreement[] = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages; page++) {
    const params: AgreementParameters & { category?: Category[] } = { limit: 1000, page };
    if (categories?.length) {
      params.category = categories;
    }
    const res = await apiService.get<PagedAgreementResponse>(
      { url, params, paramsSerializer: repeatedArrayParamsSerializer },
      user,
    );
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
  categories: Category[] = [],
): Promise<Agreement[]> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('agreement');
  const filteredAgreements: Agreement[] = [];
  const agreements: Agreement[] = [];

  const mainUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
  let mainAgreements = await fetchAllAgreementPages(apiService, mainUrl, user, categories);
  if (!includeInactiveAgreements) {
    mainAgreements = mainAgreements.filter(activeAgreement);
  }
  filteredAgreements.push(...mainAgreements);

  for (const partyId of partyIdList) {
    const delegationUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
    const allDelegationAgreements = await fetchAllAgreementPages(apiService, delegationUrl, user, categories);
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
  categories: Category[] = [],
  includeInactive: boolean = false,
): Promise<PagedAgreementsResult> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('agreement');

  const mainUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${partyId}`;
  const params: AgreementParameters & { category?: Category[] } = { limit, page };
  if (categories.length) {
    params.category = categories;
  }
  const res = await apiService.get<PagedAgreementResponse>(
    { url: mainUrl, params, paramsSerializer: repeatedArrayParamsSerializer },
    user,
  );

  let agreements = res.data.agreements ?? [];
  if (!includeInactive) {
    agreements = agreements.filter(activeAgreement).filter(a => a.mainAgreement === true);
  }

  if (page === 1) {
    const delegationAgreements: Agreement[] = [];

    for (const delegationPartyId of partyIdList) {
      const delegationUrl = `${apiBase}/${MUNICIPALITY_ID}/paged/agreements/${delegationPartyId}`;
      const allDelegationAgreements = await fetchAllAgreementPages(apiService, delegationUrl, user, categories);
      const filteredDelegations = includeInactive
        ? allDelegationAgreements
        : allDelegationAgreements.filter(activeAgreement).filter(a => a.mainAgreement === true);
      delegationAgreements.push(...filteredDelegations);
    }

    const matchedDelegationAgreements = delegationAgreements.filter(agreement =>
      delegations.some(delegation => delegation.facilities.some(facility => facility.id === agreement.facilityId)),
    );

    agreements = [...agreements, ...matchedDelegationAgreements];
  }

  agreements.sort((a, b) => (a.siteAddress ?? '').localeCompare(b.siteAddress ?? ''));

  return {
    agreements,
    _meta: res.data._meta ?? { page, limit, totalPages: 1 },
  };
};
