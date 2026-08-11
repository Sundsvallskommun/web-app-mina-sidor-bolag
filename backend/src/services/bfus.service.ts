import { UpdateConsentDto } from '@dtos/update-consent.dto';
import { BFUSConsentApiResponse } from '@/interfaces/bfus.interface';
import { HttpException } from '@/exceptions/HttpException';
import ApiService from './api.service';
import { User } from '@/interfaces/users.interface';

export const sendConsentRequest = async (data: UpdateConsentDto, user: User, apiBase: string) => {
  const apiService = new ApiService();
  const url = `${apiBase}/EP/EligableParty/PermissionRequest`;
  const response = await apiService.post<BFUSConsentApiResponse, UpdateConsentDto>({ url, data }, user);
  return response.data;
};

export const handleCustomerIds = async (customerIds: string) => {
  if (!customerIds) {
    throw new HttpException(400, 'No customer ids found');
  }

  const ids = customerIds
    .split(',')
    .map(id => Number(id.trim()))
    .filter(id => !Number.isNaN(id));

  if (!ids.length) {
    throw new HttpException(400, 'Customer ids must be numbers');
  }

  return ids;
};
