import dayjs from 'dayjs';

export function generateYearsBetween(fromDate: string) {
  let startYear = 2022;
  const endDate = parseInt(dayjs(fromDate).format('YYYY'));
  const years: string[] = [];

  for (let i = startYear; i < endDate; i++) {
    years.push(dayjs(`${startYear}-01-01`).format('YYYY-MM-DD'));
    startYear++;
  }

  return years.reverse();
}

export function generateSelectableMonths(today: string) {
  let startYear = 2022;
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
