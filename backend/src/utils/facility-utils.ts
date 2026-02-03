import { Category } from '@/data-contracts/agreement/data-contracts';
import { InstalledBaseItem } from '@/data-contracts/installedbase/data-contracts';

export const getCategoryFromInstalledBaseType = (type: string | undefined): Category => {
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
      return undefined;
  }
};

export const relevantFacility = (facility: InstalledBaseItem): boolean => {
  const relevantCategories: Category[] = [Category.ELECTRICITY, Category.ELECTRICITY_TRADE, Category.DISTRICT_HEATING];

  const category = getCategoryFromInstalledBaseType(facility.type);

  return relevantCategories.includes(category);
};
