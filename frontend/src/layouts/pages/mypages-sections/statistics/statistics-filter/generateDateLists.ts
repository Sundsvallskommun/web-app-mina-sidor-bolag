import dayjs, { Dayjs } from 'dayjs';

const getStartYear = (today: Dayjs) => {
  return parseInt(dayjs(today).startOf('year').subtract(3, 'year').format('YYYY'));
};

function generateYearsBetween(start: number, end: number) {
  const years: string[] = [];
  for (let i = start; i < end + 1; i++) {
    years.push(dayjs(`${start}-01-01`).format('YYYY-MM-DD'));
    start++;
  }
  return years.reverse();
}

export function generateComparableYears(selectedYear: string) {
  return generateYearsBetween(getStartYear(dayjs()), parseInt(dayjs(selectedYear).subtract(1, 'year').format('YYYY')));
}

export function generateSelectableYears(today: string) {
  const startYear = getStartYear(dayjs(today));
  const endYear = parseInt(dayjs(today).format('YYYY'));
  return generateYearsBetween(startYear, endYear);
}

export function generateSelectableMonths(today: string) {
  let startYear = getStartYear(dayjs(today));
  const endYear = parseInt(dayjs(today).format('YYYY'));
  const months: { label: string; value: string }[] = [];

  for (let i = startYear; i < endYear + 1; i++) {
    for (let month = 0; month < 12; month++) {
      if (i === endYear && month > parseInt(dayjs(today).format('M')) - 1) {
        continue; // Skip months beyond the current month in the end year
      }
      const monthLabel = dayjs().month(month).format('MMM');
      const yearLabel = dayjs().year(i).format('YYYY');
      months.push({
        label: `${monthLabel} ${yearLabel}`,
        value: dayjs().year(i).month(month).startOf('month').format('YYYY-MM-DD'),
      });
    }
    startYear++;
  }

  return months.reverse();
}
