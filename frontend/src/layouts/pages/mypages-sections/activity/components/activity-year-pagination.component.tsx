'use client';

import { Icon } from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActivityYearPaginationProps {
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
}

const arrowClass =
  'flex items-center text-dark-secondary hover:text-dark-primary disabled:cursor-default disabled:text-dark-disabled disabled:hover:text-dark-disabled';

export const ActivityYearPagination = ({ years, selectedYear, onSelect }: ActivityYearPaginationProps) => {
  const { t } = useTranslation('activity');

  const activeIndex = years.indexOf(selectedYear);

  const goTo = (index: number) => {
    if (index >= 0 && index < years.length) {
      onSelect(years[index]);
    }
  };

  return (
    <nav
      className="flex items-center justify-between"
      aria-label={t('activity:pagination.label')}
      data-cy="activity-year-pagination"
    >
      <button
        type="button"
        className={arrowClass}
        onClick={() => goTo(activeIndex - 1)}
        disabled={activeIndex <= 0}
        aria-label={t('activity:pagination.previousYear')}
      >
        <Icon icon={<ArrowLeft />} />
      </button>

      {years.map((year) => {
        const isActive = year === selectedYear;
        return (
          <button
            key={year}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(year)}
            className={`rounded-full px-8 focus-visible:ring ring-ring ring-offset ${
              isActive
                ? 'font-bold no-underline text-dark-primary'
                : 'cursor-pointer underline underline-offset-2 text-vattjom-surface-primary'
            }`}
            data-cy={`activity-year-${year}`}
          >
            {year}
          </button>
        );
      })}

      <button
        type="button"
        className={arrowClass}
        onClick={() => goTo(activeIndex + 1)}
        disabled={activeIndex >= years.length - 1}
        aria-label={t('activity:pagination.nextYear')}
      >
        <Icon icon={<ArrowRight />} />
      </button>
    </nav>
  );
};
