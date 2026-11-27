'use client';

import { cx, DatePicker, FormLabel } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useStatisticsFilter, useStatisticsPeriod } from '../statistics-filter.store';

export const StatisticsFilterDay: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const { t } = useTranslation('statistics');
  const setDate = useStatisticsFilter((state) => state.setDate);
  const { date } = useStatisticsPeriod();

  return (
    <div className={cx(`flex flex-col gap-8 w-full lg:pt-0`)}>
      <FormLabel className="text-label-medium stats:text-label-small">{t('statistics:day')}</FormLabel>
      <DatePicker
        size={size}
        className="w-full"
        type="date"
        value={date}
        min={dayjs().startOf('year').subtract(3, 'year').format('YYYY-MM-DD')}
        max={dayjs().format('YYYY-MM-DD')}
        name="day"
        onChange={(event) => {
          if (dayjs(event.target.value).isValid()) setDate(event.target.value, 'day');
        }}
        data-cy="day-select"
      />
    </div>
  );
};
