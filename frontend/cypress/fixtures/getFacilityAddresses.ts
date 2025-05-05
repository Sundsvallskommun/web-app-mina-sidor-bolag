import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const getFacilityAddresses: (representingMode: RepresentingMode) => ApiResponse<{address: string; facilityIds: string[]}[]> = (
  representingMode = representingModeDefault
) => ({
  data: [
    {
        address: 'Kummelgatan 16',
        facilityIds: [
            '735999109151605013',
            '735999109515160509',
            '9151605012',
        ],
    },
],
  message: 'success',
});
