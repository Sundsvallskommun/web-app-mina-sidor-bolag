import { AnnouncementGroup } from '@interfaces/announcements';

export const appOrganizations = ['5564786647', '5565027223'];

export const safeOrganizations = (myOrganizations: string[]): string[] => {
  return appOrganizations.filter((org) => myOrganizations.includes(org));
};

export const getCustomerGroups = (customerEngagements: string[]): AnnouncementGroup[] => {
  return safeOrganizations(customerEngagements).reduce((groups, organizationNumber) => {
    switch (organizationNumber) {
      case '5564786647':
        return [...groups, AnnouncementGroup.CUSTOMER_SV_ENERGI];

      case '5565027223':
        return [...groups, AnnouncementGroup.CUSTOMER_SV_EL];

      default:
        return groups;
    }
  }, [] as AnnouncementGroup[]);
};
