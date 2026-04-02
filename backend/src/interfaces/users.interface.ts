export interface User extends Record<string, unknown> {
  partyId: string;
  personNumber: string;
  name: string;
  givenName: string;
  surname: string;
  username: string;
  nameID?: string;
  nameIDFormat?: string;
  sessionIndex?: string;
  permissions: Permissions;
}

export interface Permissions {
  canImpersonateUser: boolean;
}

export interface UserEngagement {
  userPersonNumber: string;
  userPartyId: string;
  canRepresent: { name: string; representingNumber: string }[];
}
