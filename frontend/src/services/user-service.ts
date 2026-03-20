import { User } from '@interfaces/user';
import { ApiResponse, apiService } from './api-service';

const handleSetUserResponse: (res: ApiResponse<User>) => User = (res) => ({
  name: res.data.name,
  userSettings: {
    feedbackLifespan: res.data.userSettings.feedbackLifespan,
    readNotificationsClearedDate: res.data.userSettings.readNotificationsClearedDate,
  },
  relations: {
    customerNumber: res.data.relations.customerNumber,
    customerRelations: res.data.relations.customerRelations,
  },
  addresses: res.data.addresses,
  facilities: res.data.facilities,
  extendedView: res.data.extendedView,
});

export const getMe: () => Promise<User> = () => {
  return apiService
    .get<ApiResponse<User>>('me')
    .then((res) => handleSetUserResponse(res.data))
    .catch(() => Promise.reject('No user found'));
};
