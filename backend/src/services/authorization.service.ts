import { Permissions } from '@interfaces/users.interface';
import { ADMIN_GROUP, MUNICIPALITY_ID } from '@config';
import { getApiBase } from '@/config/api-config';
import ApiService from '@services/api.service';
import { OUChildren } from '@/data-contracts/activedirectory/data-contracts';
import { logger } from '@utils/logger';
import { HttpException } from '@exceptions/HttpException';
import { Account } from '@/data-contracts/employee/data-contracts';

export const defaultPermissions: () => Permissions = () => ({
  canImpersonateUser: false,
  isImpersonatingUser: false,
});

export const getPermissions = async (personId: string): Promise<Permissions> => {
  const permissions: Permissions = defaultPermissions();

  const userGroups = await getUserGroups(personId);
  if (!userGroups.length || !ADMIN_GROUP) return permissions;

  const groupsList = userGroups.map((g: string) => g.toLowerCase());
  const adminGroup = ADMIN_GROUP.toLowerCase();
  permissions.canImpersonateUser = groupsList.includes(adminGroup);

  return permissions;
};

export const getPermissionsByGroups = async (groups: string[] = []): Promise<Permissions> => {
  const permissions: Permissions = defaultPermissions();
  if (!groups.length || !ADMIN_GROUP) return permissions;

  const groupsList = groups.map((g: string) => g.toLowerCase());
  const adminGroup = ADMIN_GROUP.toLowerCase();
  permissions.canImpersonateUser = groupsList.includes(adminGroup);

  return permissions;
};

export const getLoginName = async (personId: string) => {
  if (!personId) return undefined;

  try {
    const apiService = new ApiService();
    const apiBase = getApiBase('employee');
    const url = `${apiBase}/${MUNICIPALITY_ID}/employed/${personId}/accounts`;
    const account = await apiService.get<Account>({ url }, { username: 'unknown' });
    return account.data[0].loginname;
  } catch (error) {
    if (error.status === 404 || error.status === 400) {
      logger.info('User is not employed');
      return undefined;
    } else {
      throw new HttpException(500, 'Could not fetch login name');
    }
  }
};

export const getUserGroups = async (personId: string) => {
  if (!personId) return [];

  const loginName: string | undefined = await getLoginName(personId);
  if (!loginName) return [];

  try {
    const apiService = new ApiService();
    const apiBase = getApiBase('activedirectory');
    const url = `${apiBase}/${MUNICIPALITY_ID}/usergroups/PERSONAL/${loginName}`;
    const userGroups = await apiService.get<OUChildren[]>({ url }, { username: loginName });
    return userGroups.data.filter(g => !!g.name).map(group => group.name);
  } catch (error) {
    if (error.status === 404 || error.status == 400) {
      logger.info('User has no groups');
      return [];
    } else {
      throw new HttpException(500, 'Could not fetch user groups');
    }
  }
};
