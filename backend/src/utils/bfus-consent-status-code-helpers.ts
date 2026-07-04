import { BFUSConsent, BFUSEndReason, BFUSStatusCode } from '@/interfaces/bfus.interface';

export type ConsentStatusCategory = 'new' | 'ongoing' | 'denied' | 'ended' | 'revoked' | 'expired';

export const mapPartStatus = (part: BFUSConsent): ConsentStatusCategory => {
  switch (part.StatusCode) {
    case BFUSStatusCode.New:
      return 'new';

    case BFUSStatusCode.Active:
      return 'ongoing';

    case BFUSStatusCode.Denied:
      return 'denied';

    case BFUSStatusCode.Ended:
      if (part.EndReason === BFUSEndReason.Revoked) return 'revoked';
      if (part.EndReason === BFUSEndReason.Expired) return 'expired';
      return 'ended';
  }
};
