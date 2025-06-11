import { HttpException } from '@/exceptions/HttpException';
import ApiService from './api.service';
import { ClientDelegate } from '@/responses/contactsettings.response';
import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { RequestWithUser } from '@/interfaces/auth.interface';

export const deleteDelegate = async (delegateId: string, req: RequestWithUser): Promise<boolean> => {
  const apiService = new ApiService();
  const apiBase = getApiBase('contactsettings');
  if (!delegateId) {
    throw new HttpException(400, 'Bad Request');
  }
  const url = `${apiBase}/${MUNICIPALITY_ID}/delegates/${delegateId}`;
  const res = await apiService.delete<ClientDelegate>({ url }, req.user).catch(error => {
    console.error('Error deleting delegate:', error);
    return false;
  });
  console.log('deleteDelegate res', res);

  return true;
};
