import { RepresentingEntity, RepresentingMode } from '@interfaces/representing.interface';

export const buildLoginMetadata = (representing: RepresentingEntity): { key: string; value: string }[] => {
  const person = representing.PRIVATE;
  const business = representing.mode === RepresentingMode.BUSINESS ? representing.BUSINESS : undefined;

  return [
    ...(person
      ? [
          { key: 'loggedInUserPartyId', value: person.partyId },
          { key: 'loggedInUserName', value: person.name },
        ]
      : []),
    ...(business
      ? [
          { key: 'typeOfRepresentative', value: business.isAuthorizedSignatory ? 'Organization' : 'Delegate' },
          { key: 'representativePartyId', value: business.partyId },
          { key: 'organizationName', value: business.organizationName },
        ]
      : []),
  ];
};
