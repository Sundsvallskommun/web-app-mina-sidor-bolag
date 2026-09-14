export interface AnnouncementResponse {
  announcements: Announcement[];
}

export type Announcement = {
  id: number;
  title: string;
  text: string;
  urlTitle: string;
  url: string;
  groups: AnnouncementGroup[];
  image?: string;
  imageAlt?: string;
};

export enum AnnouncementGroup {
  PRIVATE = 'private',
  BUSINESS = 'business',
  CUSTOMER_SV_ENERGI = 'customer-sv-energi',
  CUSTOMER_SV_EL = 'customer-sv-el',
}
