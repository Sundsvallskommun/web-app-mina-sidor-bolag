import { Icon } from '@sk-web-gui/react';
import { Lightbulb, Snowflake, Trash, UtilityPole, WavesIcon } from 'lucide-react';

export interface PaddedListIconProps {
  color: string;
  iconName: string;
}

export const PaddedListIcon = (props: PaddedListIconProps) => {
  const { color, iconName } = props;

  const setIcon = (iconName: string) => {
    switch (iconName) {
      case 'utility':
        return <UtilityPole />;
      case 'waves':
        return <WavesIcon />;
      case 'lightbulb':
        return <Lightbulb />;
      case 'trash':
        return <Trash />;
      case 'snowflake':
        return <Snowflake />;
      default:
    }
  };

  return color === 'warning' ? (
    <div
      className={`bg-brand-secondary flex justify-center items-center lg:w-52 lg:h-52 md:h-48 md:w-48 h-32 w-32 md:p-0 p-4 rounded-button mr-16`}
    >
      <Icon icon={setIcon(iconName)} size={30} />
    </div>
  ) : (
    <div
      className={`bg-vattjom-background-200 flex justify-center items-center lg:w-52 lg:h-52 md:h-48 md:w-48 h-32 w-32 md:p-0 p-4 rounded-button mr-16`}
    >
      <Icon icon={setIcon(iconName)} size={30} />
    </div>
  );
};
