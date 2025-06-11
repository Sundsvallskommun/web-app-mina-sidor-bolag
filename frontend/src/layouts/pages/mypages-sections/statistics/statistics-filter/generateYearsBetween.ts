export function generateYearsBetween() {
  let startYear = 2022;
  const endDate = new Date().getFullYear();
  const years: number[] = [];

  for (let i = startYear; i < endDate; i++) {
    years.push(startYear);
    startYear++;
  }

  return years.reverse();
}
