import { Permissions } from '@interfaces/users.interface';
import { ADMIN_GROUP } from '@config';

export const defaultPermissions: () => Permissions = () => ({
  canImpersonateUser: false,
  isImpersonatingUser: false,
});

export const getPermissionsByGroups = async (groups: string): Promise<Permissions> => {
  const permissions: Permissions = defaultPermissions();
  if (!groups.length || !ADMIN_GROUP) return permissions;

  const groupsList = (Array.isArray(groups) ? groups : groups.split(','))
    .map(g => g.trim().toLowerCase())
    .filter(Boolean);
  const adminGroup = ADMIN_GROUP.toLowerCase();
  permissions.canImpersonateUser = groupsList.includes(adminGroup);

  return permissions;
};
