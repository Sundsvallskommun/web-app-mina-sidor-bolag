import { BusinessInformation } from '@data-contracts/backend/data-contracts';

export interface OrganisationInfo {
  organizationName: string;
  organizationNumber: string;
  information: BusinessInformation;
}
