import { Permissions } from '@interfaces/users.interface';
import { ADMIN_GROUP } from '@config';

export const defaultPermissions: () => Permissions = () => ({
  canImpersonateUser: false,
  isImpersonatingUser: false,
});

export const getPermissionsByGroups = async (groups: string[] = []): Promise<Permissions> => {
  const permissions: Permissions = defaultPermissions();
  if (!groups.length || !ADMIN_GROUP) return permissions;

  const groupsList = groups.map((g: string) => g.toLowerCase());
  const adminGroup = ADMIN_GROUP.toLowerCase();
  permissions.canImpersonateUser = groupsList.includes(adminGroup);

  return permissions;
};
