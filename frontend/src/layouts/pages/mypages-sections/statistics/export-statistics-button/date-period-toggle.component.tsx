import { Button, NavigationBar } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { DatePeriod } from './date-picker.util';

const datePeriods: DatePeriod[] = ['year', 'month', 'day'];

interface DatePeriodToggleProps {
  value: DatePeriod;
  onChange: (period: DatePeriod) => void;
}

export const DatePeriodToggle = ({ value, onChange }: DatePeriodToggleProps) => {
  const { t } = useTranslation(['statistics']);

  return (
    <NavigationBar
      className="!py-6 bg-tertiary-surface flex justify-around"
      size="md"
      data-cy="export-modal-date-toggle"
    >
      {datePeriods.map((period) => (
        <NavigationBar.Item key={`time-interval-${period}`} className="lg:w-auto w-full !p-0 !m-0">
          <Button
            className="lg:w-auto w-full !h-[12px] !py-0"
            size="sm"
            inverted={value === period}
            onClick={() => onChange(period)}
            data-cy={`export-modal-date-toggle-${period}-button`}
          >
            {t(`statistics:${period}`)}
          </Button>
        </NavigationBar.Item>
      ))}
    </NavigationBar>
  );
};
