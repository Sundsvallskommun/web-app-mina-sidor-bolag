import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from './api.service';

export const deleteContactSetting = async (contactSettingId: string, req: RequestWithUser): Promise<boolean> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('contactsettings');
  if (!contactSettingId) {
    throw new HttpException(400, 'Bad Request');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/settings/${contactSettingId}`;
  const res = await apiService.delete<boolean>({ url }, req.user).catch(error => {
    console.error('Error deleting contact setting:', error);
    return false;
  });

  return true;
};

export const deleteDelegate = async (delegateId: string, req: RequestWithUser): Promise<boolean> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('contactsettings');
  if (!delegateId) {
    throw new HttpException(400, 'Bad Request');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/delegates/${delegateId}`;
  const res = await apiService.delete<boolean>({ url }, req.user).catch(error => {
    console.error('Error deleting delegate:', error);
    return false;
  });

  return true;
};
