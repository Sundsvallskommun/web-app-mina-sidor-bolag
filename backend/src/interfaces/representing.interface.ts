import { PersonEngagement } from '@/responses/legal-entity.response';
import { ClientBusinessInformation } from './business-engagement';

export enum RepresentingMode {
  PRIVATE,
  BUSINESS,
  ADMIN,
}

export interface RepresentingBusinessEntity extends Pick<PersonEngagement, 'isAuthorizedSignatory'> {
  partyId: string;
  organizationName: string;
  organizationNumber: string;
  information: ClientBusinessInformation;
  whitelisted?: boolean;
}
export type RepresentingBusinessEntityClient = Omit<RepresentingBusinessEntity, 'partyId'>;

export interface RepresentingPrivateEntity {
  partyId: string;
  name: string;
  personNumber: string;
}
export type RepresentingPrivateEntityClient = Omit<RepresentingPrivateEntity, 'partyId' | 'personNumber'>;

export interface RepresentingEntity {
  PRIVATE?: RepresentingPrivateEntity;
  BUSINESS?: RepresentingBusinessEntity;
  mode: RepresentingMode;
}

export interface RepresentingEntityClient {
  PRIVATE?: RepresentingPrivateEntityClient;
  BUSINESS?: RepresentingBusinessEntityClient;
  mode: RepresentingMode;
}
