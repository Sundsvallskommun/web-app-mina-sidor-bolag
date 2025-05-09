import { PagesLayout } from '@layouts/pages-layout.component';
import { appName } from '@utils/app-name';
import SelfService from '@layouts/pages/mypages-sections/self-service/self-service/self-service.component';

export async function generateMetadata() {
  return {
    title: `Självservice - Företag - ${appName()}`,
  };
}

export default function Sjalvservice() {
  return (
    <PagesLayout>
      <SelfService />
    </PagesLayout>
  );
}
