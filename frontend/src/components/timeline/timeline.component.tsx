import { Badge } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ReactNode } from 'react';

export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface TimelineMonth {
  month: MonthNumber;
  children: ReactNode;
}

export interface TimelineYear {
  year: number;
  months: TimelineMonth[];
}

interface TimelineProps {
  years: TimelineYear[];
}

const monthName = (month: MonthNumber) => {
  const name = dayjs()
    .month(month - 1)
    .format('MMMM');
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const Timeline = ({ years }: TimelineProps) => {
  return (
    <div className="flex flex-col gap-64" data-cy="timeline">
      {years.map((year) => (
        <section key={year.year} className="flex flex-col gap-16 sm:gap-32">
          <h2 className="m-0 text-lead font-sans font-bold text-dark-primary">{year.year}</h2>

          <div className="flex flex-col gap-32">
            {year.months.map((month) => {
              const label = monthName(month.month);
              return (
                <div key={month.month} className="flex flex-col gap-16 sm:flex-row sm:gap-24">
                  <div className="hidden w-[74px] shrink-0 flex-col items-center gap-8 sm:flex">
                    <Badge aria-hidden color="error" inverted />
                    <span className="text-dark-primary">{label}</span>
                    <span aria-hidden className="w-2 grow bg-gray-200" />
                  </div>

                  <span className="text-dark-primary sm:hidden font-normal">{label}</span>

                  <div className="flex min-w-0 flex-1 flex-col gap-16">{month.children}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
