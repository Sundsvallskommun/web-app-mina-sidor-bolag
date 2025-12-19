import { BFUSEligiblePartyPermissionsApiResponse, EligablePartyPart } from '@interfaces/eligibility';

export const handlePendingEligibilityResponse: (data: BFUSEligiblePartyPermissionsApiResponse['data']) => {
  [key: string]: EligablePartyPart[];
} = (data) => {
  if (data) {
    return data.eligablePartyParts
      .filter((part) => part.StatusCategory === 'new')
      .reduce(function (r: { [key: string]: EligablePartyPart[] }, a: EligablePartyPart) {
        const key: string = a.EnergyServiceParty;
        r[key] = r[key] || [];
        r[key].push(a);
        return r;
      }, Object.create(null));
  } else {
    return {};
  }
};

export const pendingEligibilityHandler = (
  data: BFUSEligiblePartyPermissionsApiResponse['data']
): { [key: string]: EligablePartyPart[] } => handlePendingEligibilityResponse(data);
