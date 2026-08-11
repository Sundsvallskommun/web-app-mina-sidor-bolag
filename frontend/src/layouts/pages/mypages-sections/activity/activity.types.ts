import { MonthNumber } from '@components/timeline/timeline.component';

export type ActivityType = 'login' | 'impersonation' | 'hanActivated' | 'hanDeactivated';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  name: string;
  personNumber: string;
  timestamp: string;
  organizationName?: string;
  supportReason?: string;
  /** HAN-port events: address, facilityId */
  address?: string;
  facilityId?: string;
}

export interface ActivityMonthGroup {
  month: MonthNumber;
  items: ActivityItem[];
}

export interface ActivityYearGroup {
  year: number;
  months: ActivityMonthGroup[];
}

export interface ActivityData {
  years: ActivityYearGroup[];
  totalPages: number;
  totalElements: number;
}
