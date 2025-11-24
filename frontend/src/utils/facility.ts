export const translateCategory = (type: string | undefined): string => {
  switch (type) {
    case 'ELECTRICITY':
      return 'El';
    case 'DISTRICT_HEATING':
      return 'Fjärrvärme';
    case 'ELECTRICITY_TRADE':
      return 'Elproduktion';
    case 'COMMUNICATION':
      return 'Bredband';
    default:
      return '-';
  }
};

export const translateAggregateOn = (type: string | undefined): string => {
  switch (type) {
    case 'HOUR':
      return 'Timme';
    case 'DAY':
      return 'Dag';
    case 'MONTH':
      return 'Månad';
    case 'YEAR':
      return 'År';
    case 'QUARTERLY':
      return 'Kvartal';
    default:
      return '-';
  }
};

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
