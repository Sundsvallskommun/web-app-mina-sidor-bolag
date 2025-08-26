export interface FacilityDelegation {
  id?: string;
  facilities?: Facility[];
  delegatedTo?: string;
  owner?: string;
  municipalityId?: string;
  created?: string;
  updated?: string;
}

export interface FacilityCreateDelegation {
  facilities: Facility[];
  delegatedTo: string;
  owner: string;
}

export interface Facility {
  id: string;
  businessEngagementOrgId?: string;
}

export interface FacilityUpdateDelegation {
  facilities?: Facility[];
  delegatedTo?: string;
}

export interface ResolvedFacilityDelegation extends FacilityDelegation {
  delegatedToName: string;
  delegatedToBirthDate: string;
}
