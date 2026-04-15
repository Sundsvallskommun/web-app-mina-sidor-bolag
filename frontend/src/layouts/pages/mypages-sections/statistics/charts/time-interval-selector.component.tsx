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
    <div className="flex flex-row items-center">
      <div className="mr-10">{t('statistics:consumption.timeInterval')}</div>
      <NavigationBar className="md:w-auto w-full md:mt-0 mt-40" showBackground>
        <NavigationBar.Item className="md:w-auto w-full">
          <Button className="md:w-auto w-full" onClick={() => onChangeCurrent(0)} inverted={current === 0}>
            60 min
          </Button>
        </NavigationBar.Item>
        <NavigationBar.Item className="md:w-auto w-full">
          <Button className="md:w-auto w-full" onClick={() => onChangeCurrent(1)} inverted={current === 1}>
            15 min
          </Button>
        </NavigationBar.Item>
      </NavigationBar>
    </div>
  );
};
