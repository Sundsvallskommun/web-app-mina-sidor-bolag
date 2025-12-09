import { BFUS_API_KEY, BFUS_BASE_URL } from '@/config';
import { UpdatePermissionDto } from '@/dtos/update-permission.dto';
import { HttpException } from '@/exceptions/HttpException';
import { BFUSEligablePartyPermissionResponse } from '@/interfaces/bfus.interface';
import axios from 'axios';

export const validatePermissionRequest = (operation: 'grant' | 'deny' | 'revoke', dto: UpdatePermissionDto) => {
  const req = dto.PermissionRequest;

  if (operation === 'grant' || operation === 'revoke') {
    if (!req.ContractIdList || req.ContractIdList.length === 0) {
      throw new HttpException(400, `ContractIdList is required for operation '${operation}'`);
    }
  }

  if (operation === 'deny') {
    if (!req.CustomerId) {
      throw new HttpException(400, "CustomerId is required for operation 'deny'");
    }
  }
};

export const sendPermissionRequest = async (dto: UpdatePermissionDto) => {
  const url = `${BFUS_BASE_URL}/EP/EligableParty/PermissionRequest`;

  const response = await axios.post<BFUSEligablePartyPermissionResponse>(url, dto, {
    headers: { Authorization: BFUS_API_KEY },
  });

  return response.data;
};
