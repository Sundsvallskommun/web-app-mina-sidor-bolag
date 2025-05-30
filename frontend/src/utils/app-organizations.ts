export const appOrganizations = ['5564786647', '5565027223'];

export const safeOrganizations = (myOrganizations: string[]): string[] => {
  return appOrganizations.filter((org) => myOrganizations.includes(org));
};
