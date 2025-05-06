import { PagesLayout } from '@layouts/pages-layout.component';
import { appName } from '@utils/app-name';
import Agreements from '@layouts/pages/mypages-sections/agreements.component';

export async function generateMetadata() {
  return {
    title: `Avtal - Privat - ${appName()}`,
  };
}

export default function Avtal() {
  return (
    <PagesLayout>
      <Agreements />
    </PagesLayout>
  );
}
