import { RepresentingEntity, RepresentingMode } from '../interfaces/representing.interface';
import { RequestWithUser } from '@interfaces/auth.interface';

export const getRepresentingPartyId = (representing: RepresentingEntity) =>
  representing[RepresentingMode[representing.mode]]?.partyId;

export const hasRepresentingContext = (req: RequestWithUser): boolean => {
  const representing = req.session?.representing;
  return !!(representing && getRepresentingPartyId(representing));
};
