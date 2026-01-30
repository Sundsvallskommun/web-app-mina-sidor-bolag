import { BFUS_API_KEY, BFUS_BASE_URL } from '@/config';
import { UpdatePermissionDto } from '@/dtos/update-permission.dto';
import { BFUSEligablePartyPermissionResponse } from '@/interfaces/bfus.interface';
import axios from 'axios';

export const sendPermissionRequest = async (dto: UpdatePermissionDto) => {
  const url = `${BFUS_BASE_URL}/EP/EligableParty/PermissionRequest`;

  const response = await axios.post<BFUSEligablePartyPermissionResponse>(url, dto, {
    headers: { Authorization: BFUS_API_KEY },
  });

  return response.data;
};
