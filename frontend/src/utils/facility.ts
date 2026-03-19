import { Category } from '@interfaces/measurement-data';

export const getCategoryFromInstalledBaseType = (type: string | undefined): string => {
  switch (type) {
    case 'El':
      return Category.ELECTRICITY;
    case 'Elförbrukning':
      return Category.ELECTRICITY;
    case 'Fjärrvärme':
      return Category.DISTRICT_HEATING;
    case 'Elproduktion':
      return Category.ELECTRICITY;
    case 'Bredband':
      return Category.COMMUNICATION;
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
