import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import {
  InstalledBaseItem as DwrInstalledBaseItem,
  InstalledBaseResponse as DwrInstalledBaseResponse,
} from '@/data-contracts/datawarehousereader/data-contracts';
import { InstalledBaseItem } from '@/data-contracts/installedbase/data-contracts';
import ApiService, { Sender } from '@/services/api.service';

export const fromDwrInstalledBaseItem = (item: DwrInstalledBaseItem): InstalledBaseItem => ({
  type: item.type,
  facilityId: item.facilityId,
  placementId: item.placementId,
  facilityCommitmentStartDate: item.dateFrom,
  facilityCommitmentEndDate: item.dateTo ?? undefined,
  lastModifiedDate: item.dateLastModified,
  address: {
    street: item.street ?? '',
    postalCode: item.postCode,
    city: item.city,
    careOf: item.careOf,
    propertyDesignation: item.propertyDesignation,
  },
  metaData: item.metaData ?? [],
});

export const fetchInstalledBase = async (
  partyId: string,
  organizationIds: string[],
  user: Sender,
): Promise<InstalledBaseItem[]> => {
  if (!partyId || organizationIds.length === 0) return [];

  const apiService = new ApiService();
  const url = `${getApiBase('datawarehousereader')}/${MUNICIPALITY_ID}/installedbase/${partyId}`;
  const items: DwrInstalledBaseItem[] = [];

  for (let page = 1; ; page++) {
    const res = await apiService.get<DwrInstalledBaseResponse>(
      {
        url,
        params: {
          organizationIds: Array.from(new Set(organizationIds)).join(','),
          page,
        },
      },
      user,
    );
    const pageItems = res.data?.installedBase ?? [];
    items.push(...pageItems);

    // DWR uses its own page size; follow `_meta.totalPages` until the last page.
    // An empty page always ends the walk, so a wrong `_meta` can't make us loop forever.
    const totalPages = res.data?._meta?.totalPages ?? 1;
    if (pageItems.length === 0 || page >= totalPages) break;
  }

  return items.map(fromDwrInstalledBaseItem);
};

/** Removes repeated facilities (same facilityId and type), keeping the first occurrence */
export const uniqueFacilities = <T extends InstalledBaseItem>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = `${item.facilityId}|${item.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
