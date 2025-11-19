import { BusinessInformation } from '@data-contracts/backend/data-contracts';

export interface BusinessEngagement {
  organizationName: string;
  organizationNumber: string;
}

export interface OrganisationInfo {
  organizationName: string;
  organizationNumber: string;
  information: BusinessInformation;
}
