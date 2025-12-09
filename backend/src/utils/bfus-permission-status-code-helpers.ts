import { BFUSEligablePartyPart, BFUSEndReason, BFUSStatusCode } from '@/interfaces/bfus.interface';

export const isNew = (part: BFUSEligablePartyPart) => {
  return part.StatusCode === BFUSStatusCode.New;
};

export const isOngoing = (part: BFUSEligablePartyPart) => {
  return part.StatusCode === BFUSStatusCode.Active;
};

export const isDenied = (part: BFUSEligablePartyPart) => {
  return part.StatusCode === BFUSStatusCode.Denied;
};

export const isEnded = (part: BFUSEligablePartyPart) => {
  return part.StatusCode === BFUSStatusCode.Ended;
};

export const isRevoked = (part: BFUSEligablePartyPart) => {
  return part.StatusCode === BFUSStatusCode.Ended && part.EndReason === BFUSEndReason.Revoked;
};

export const isExpired = (part: BFUSEligablePartyPart) => {
  return part.StatusCode === BFUSStatusCode.Ended && part.EndReason === BFUSEndReason.Expired;
};
