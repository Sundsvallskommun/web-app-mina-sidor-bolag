import dayjs from 'dayjs';

export function generateYearsBetween(fromDate: string) {
  let startYear = 2022;
  const endDate = parseInt(dayjs(fromDate).format('YYYY'));
  const years: number[] = [];

  for (let i = startYear; i < endDate; i++) {
    years.push(startYear);
    startYear++;
  }

  return years.reverse();
}
