import { Permissions } from '@interfaces/users.interface';
import { ADMIN_GROUP, MUNICIPALITY_ID } from '@config';
import { getApiBase } from '@/config/api-config';
import ApiService from '@services/api.service';
import { OUChildren } from '@/data-contracts/activedirectory/data-contracts';
import { logger } from '@utils/logger';
import { HttpException } from '@exceptions/HttpException';

export const defaultPermissions: () => Permissions = () => ({
  canImpersonateUser: false,
});

export const getPermissions = (groups: string[]): Permissions => {
  const permissions: Permissions = defaultPermissions();

  const groupsList = groups.map((g: string) => g.toLowerCase());
  const adminGroup = ADMIN_GROUP.toLowerCase();

  groupsList.forEach(group => {
    if (group === adminGroup) {
      permissions.canImpersonateUser = true;
    }
  });

  return permissions;
};

export const getUserGroups = async (username: string | undefined) => {
  if (!username) return [];

  try {
    const apiService = new ApiService();
    const apiBase = getApiBase('activedirectory');
    const url = `${apiBase}/${MUNICIPALITY_ID}/usergroups/PERSONAL/${username}`;
    const userGroups = await apiService.get<OUChildren[]>({ url }, { username: username });
    return userGroups.data.map(group => group.name);
  } catch (error) {
    if (error.status === 404) {
      logger.info('User has no groups');
      return [];
    } else {
      throw new HttpException(500, 'Could not fetch user groups');
    }
  }
};
