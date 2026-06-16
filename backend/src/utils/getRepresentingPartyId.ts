import { RequestWithUser } from '../interfaces/auth.interface';
import { RepresentingEntity, RepresentingMode } from '../interfaces/representing.interface';

export const getRepresentingPartyId = (representing: RepresentingEntity) =>
  representing[RepresentingMode[representing.mode]]?.partyId;

/**
 * True when the session carries a real citizen context (a resolvable representing
 * partyId). Citizen login and impersonation set it; a plain admin login does not.
 * Used to gate citizen data-fetching so admins don't trigger 401/500s.
 */
export const hasRepresentingContext = (req: RequestWithUser): boolean => {
  const representing = req.session?.representing;
  return !!(representing && getRepresentingPartyId(representing));
};
