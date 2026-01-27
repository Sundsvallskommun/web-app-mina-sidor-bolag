import { BFUS_API_KEY, BFUS_API_BASE_URL } from '@/config';
import { UpdatePermissionDto } from '@/dtos/update-permission.dto';
import { BFUSEligablePartyPermissionResponse } from '@/interfaces/bfus.interface';
import axios from 'axios';

export const sendPermissionRequest = async (dto: UpdatePermissionDto, token: string) => {
  const url = `${BFUS_API_BASE_URL}/bfusewiopenapi3/1.0.0/EP/EligableParty/PermissionRequest`;
  console.log(url);
  const response = await axios.post<BFUSEligablePartyPermissionResponse>(url, dto, {
    headers: { Authorization: `Bearer ${token}, ${BFUS_API_KEY}` },
  });

  return response.data;
};
