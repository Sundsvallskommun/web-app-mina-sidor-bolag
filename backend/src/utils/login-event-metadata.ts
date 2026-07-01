import { RepresentingEntity, RepresentingMode } from '@interfaces/representing.interface';

export const buildLoginMetadata = (representing: RepresentingEntity) => {
  const metadata: { key: string; value: string }[] = [];

  const person = representing.PRIVATE;
  if (person) {
    metadata.push({ key: 'loggedInUserPartyId', value: person.partyId });
    metadata.push({ key: 'loggedInUserName', value: person.name });
  }

  const business = representing.BUSINESS;
  if (representing.mode === RepresentingMode.BUSINESS && business) {
    metadata.push({ key: 'typeOfRepresentative', value: business.isAuthorizedSignatory ? 'Organization' : 'Delegate' });
    metadata.push({ key: 'representativePartyId', value: business.partyId });
    metadata.push({ key: 'organizationName', value: business.organizationName });
  }

  return metadata;
};
