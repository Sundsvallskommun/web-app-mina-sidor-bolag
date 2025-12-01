export const getCategoryFromInstalledBaseType = (type: string | undefined): string => {
  switch (type) {
    case 'El':
      return 'ELECTRICITY';
    case 'Elförbrukning':
      return 'ELECTRICITY';
    case 'Fjärrvärme':
      return 'DISTRICT_HEATING';
    case 'Elproduktion':
      return 'ELECTRICITY';
    case 'Bredband':
      return 'COMMUNICATION';
    default:
      return '';
  }
};

export const getEventCategory = (type: string | undefined): string => {
  switch (type) {
    case 'El':
      return 'ELECTRICITY';
    case 'Elförbrukning':
      return 'ELECTRICITY';
    case 'Fjärrvärme':
      return 'DISTRICT_HEATING';
    case 'Elproduktion':
      return 'ELECTRICITY_PRODUCTION';
    case 'Bredband':
      return 'COMMUNICATION';
    default:
      return '';
  }
};
