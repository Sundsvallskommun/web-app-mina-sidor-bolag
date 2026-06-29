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
