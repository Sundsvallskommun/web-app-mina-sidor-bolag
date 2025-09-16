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
}
