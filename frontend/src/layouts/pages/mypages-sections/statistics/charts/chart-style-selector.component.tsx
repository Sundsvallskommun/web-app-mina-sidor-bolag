'use client';
import { Button, Icon, NavigationBar } from '@sk-web-gui/react';
import { BarChart3Icon, TableIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChartStyleSelectorProps {
  current: number;
  onChangeCurrent: (current: number) => void;
}

export const ChartStyleSelector: React.FC<ChartStyleSelectorProps> = ({ current, onChangeCurrent }) => {
  const { t } = useTranslation();
  return (
    <NavigationBar className="md:w-auto w-full md:mt-0 mt-40" showBackground>
      <NavigationBar.Item className="md:w-auto w-full">
        <Button className="md:w-auto w-full" onClick={() => onChangeCurrent(0)} inverted={current === 0}>
          <Icon icon={<BarChart3Icon />} className="mr-8" /> {t('statistics:chart')}
        </Button>
      </NavigationBar.Item>
      <NavigationBar.Item className="md:w-auto w-full">
        <Button className="md:w-auto w-full" onClick={() => onChangeCurrent(1)} inverted={current === 1}>
          <Icon icon={<TableIcon />} className="mr-8" /> {t('statistics:table')}
        </Button>
      </NavigationBar.Item>
    </NavigationBar>
  );
};
