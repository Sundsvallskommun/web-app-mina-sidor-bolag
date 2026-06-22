'use client';
import { Button, NavigationBar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface TimeIntervalSelectorProps {
  current: number;
  onChangeCurrent: (current: number) => void;
}

export const TimeIntervalSelector: React.FC<TimeIntervalSelectorProps> = ({ current, onChangeCurrent }) => {
  const { t } = useTranslation();
  return (
    <div className="flex md:flex-row flex-col md:items-center items-start gap-8">
      <div className="text-label-medium">{t('statistics:consumption.timeInterval')}</div>
      <NavigationBar className="md:w-auto w-full" showBackground>
        <NavigationBar.Item className="lg:w-auto w-full">
          <Button className="lg:w-auto w-full" onClick={() => onChangeCurrent(0)} inverted={current === 0}>
            60 min
          </Button>
        </NavigationBar.Item>
        <NavigationBar.Item className="lg:w-auto w-full">
          <Button className="lg:w-auto w-full" onClick={() => onChangeCurrent(1)} inverted={current === 1}>
            15 min
          </Button>
        </NavigationBar.Item>
      </NavigationBar>
    </div>
  );
};
