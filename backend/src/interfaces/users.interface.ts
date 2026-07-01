export interface Permissions {
  canImpersonateUser: boolean;
  isImpersonatingUser: boolean;
}

export interface UserEngagement {
  userPersonNumber: string;
  userName: string;
  userPartyId: string;
  canRepresent: { name: string; representingNumber: string }[];
}
export type UserType = 'customer' | 'admin';

export interface User extends Record<string, unknown> {
  partyId: string;
  personNumber?: string;
  name: string;
  givenName: string;
  surname: string;
  username: string;
  userType?: UserType;
  email?: string;
  groups?: string[];
  nameID?: string;
  nameIDFormat?: string;
  sessionIndex?: string;
  permissions: Permissions;
}
