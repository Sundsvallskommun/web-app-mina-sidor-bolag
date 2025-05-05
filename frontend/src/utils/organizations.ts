export const getOrganizationName = (organizationNumber: string) => {
    switch (organizationNumber) {
    case '5564786647':
        return 'Sundsvall Energi';
    case '5565027223':
        return 'Sundsvall Elnät';
    default: 
        return 'Okänt';
    }
};