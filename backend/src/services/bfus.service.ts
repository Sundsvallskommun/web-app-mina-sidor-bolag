import { API_BASE_URL, BFUS_API_KEY } from '@/config';
import { UpdatePermissionDto } from '@/dtos/update-permission.dto';
import { BFUSEligablePartyPermissionResponse } from '@/interfaces/bfus.interface';
import axios from 'axios';
import { getApiBase } from '@/config/api-config';

export const sendPermissionRequest = async (dto: UpdatePermissionDto, requireToken: () => Promise<string>) => {
  const token = await requireToken();
  const apiBase = getApiBase('bfus');
  const url = `${API_BASE_URL}/${apiBase}/EP/EligableParty/PermissionRequest`;

  const response = await axios.post<BFUSEligablePartyPermissionResponse>(url, dto, {
    headers: { Authorization: `Bearer ${token}, ${BFUS_API_KEY}` },
  });

  return response.data;
};
