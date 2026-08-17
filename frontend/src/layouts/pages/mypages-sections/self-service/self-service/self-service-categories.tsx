import { LightbulbIcon, SnowflakeIcon, TextIcon, WavesIcon, WifiIcon } from 'lucide-react';
import { ReactElement } from 'react';

interface SelfServiceCategory {
  facilityTypes: string[];
  icon: ReactElement;
  bgColor: string;
}

export const selfServiceCategories: Record<string, SelfServiceCategory> = {
  Allmänt: {
    facilityTypes: [],
    icon: <TextIcon />,
    bgColor: 'bg-background-color-mixin-2',
  },
  Elhandel: {
    facilityTypes: ['Elhandel'],
    icon: <TextIcon />,
    bgColor: 'bg-brand-secondary',
  },
  Elnät: {
    facilityTypes: ['El', 'Elproduktion'],
    icon: <LightbulbIcon />,
    bgColor: 'bg-vattjom-surface-accent',
  },
  Energitjänster: {
    facilityTypes: ['Fjärrvärme'],
    icon: <TextIcon />,
    bgColor: 'bg-vattjom-surface-accent',
  },
  Fjärrvärme: {
    facilityTypes: ['Fjärrvärme'],
    icon: <WavesIcon />,
    bgColor: 'bg-brand-secondary',
  },
};

const categoryOrder = ['Allmänt', 'Elhandel', 'Elnät', 'Energitjänster', 'Fjärrvärme'];

export const categorySortIndex = (category: string): number => {
  const index = categoryOrder.indexOf(category);
  return index === -1 ? categoryOrder.length : index;
};
