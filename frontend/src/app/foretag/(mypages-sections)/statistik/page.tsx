import { PagesLayout } from '@layouts/pages-layout.component';
import { appName } from '@utils/app-name';
import Statistics from '@layouts/pages/mypages-sections/statistics.component';

export async function generateMetadata() {
  return {
    title: `Statistik - Organisation - ${appName()}`,
  };
}

export default function Statistik() {
  return (
    <PagesLayout>
      <Statistics />
    </PagesLayout>
  );
}
