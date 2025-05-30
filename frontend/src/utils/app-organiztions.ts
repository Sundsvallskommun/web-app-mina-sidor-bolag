export const appOrganiztions = ['5564786647', '5565027223'];

export const safeOrganizations = (myOrganizations: string[]): string[] => {
  return appOrganiztions.filter((org) => myOrganizations.includes(org));
};
