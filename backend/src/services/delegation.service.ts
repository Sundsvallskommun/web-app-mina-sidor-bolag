import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Delegation } from '@/data-contracts/installedbase/data-contracts';
import ApiService from './api.service';

const getDelegatedFacilities = async (partyId: string) => {
  if (!partyId) {
    throw new Error('Bad Request: partyId is required');
  }
  const apiBase = getApiBase('installedbase');

  const url = `${apiBase}/${MUNICIPALITY_ID}/delegations?delegatedTo=${partyId}`;
  const apiService = new ApiService();
  const res = await apiService.get<Delegation[]>({ url }, { username: partyId });

  return res.data ?? [];
};

export default getDelegatedFacilities;
