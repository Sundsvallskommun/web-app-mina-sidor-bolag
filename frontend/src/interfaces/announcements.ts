export enum AnnouncementGroup {
  PRIVATE = 'private',
  BUSINESS = 'business',
  CUSTOMER_SV_ENERGI = 'customer-sv-energi',
  CUSTOMER_SV_EL = 'customer-sv-el',
}

export interface Announcement {
  id: number;
  title: string;
  text: string;
  urlTitle: string;
  url: string;
  groups: AnnouncementGroup[];
  image?: string;
  imageAlt?: string;
}