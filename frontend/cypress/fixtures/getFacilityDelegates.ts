import { ApiResponse } from '../../src/services/api-service';
import { FacilityDelegation, ResolvedFacilityDelegation } from '../../src/interfaces/facility-delegation';

export const getFacilityDelegates: () => ApiResponse<ResolvedFacilityDelegation[]> = () => ({
  data: [
    {
      id: 'a-a-b-b-b',
      facilities: [
        {
          id: '111',
          businessEngagementOrgId: '5565027223',
        },
        {
          id: '222',
          businessEngagementOrgId: '5564786647',
        },
      ],
      delegatedTo: 'a-a-a-a-a',
      owner: 'b-b-b-b-b',
      municipalityId: '2281',
      created: '2025-01-01T15:10:44.952854+02:00',
      delegatedToName: 'Testperson Delegerade anläggningar',
      delegatedToBirthDate: '19500101****',
    },
  ],
  message: 'success',
});

export const patchFacilityDelegate: () => ApiResponse<ResolvedFacilityDelegation[]> = () => ({
  data: [
    {
      id: 'a-a-b-b-b',
      facilities: [
        {
          id: '111',
          businessEngagementOrgId: '5565027223',
        },
      ],
      delegatedTo: 'a-a-a-a-a',
      owner: 'b-b-b-b-b',
      municipalityId: '2281',
      created: '2025-01-01T15:10:44.952854+02:00',
      delegatedToName: 'Testperson Delegerade anläggningar',
      delegatedToBirthDate: '19500101****',
    },
  ],
  message: 'success',
});

export const postFacilityDelegate: () => ApiResponse<FacilityDelegation> = () => ({
  data: {
    facilities: [
      {
        id: '111',
        businessEngagementOrgId: '5565027223',
      },
      {
        id: '222',
        businessEngagementOrgId: '5564786647',
      },
    ],
    delegatedTo: '19500101****',
  },
  message: 'success',
});

export const deleteFacilityDelegate: () => { data: boolean; message: string } = () => ({
  data: true,
  message: 'Deleted facility delegate',
});
