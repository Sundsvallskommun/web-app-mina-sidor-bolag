import { appName } from '@utils/app-name';
import { AgreementComponent } from '@layouts/pages/mypages-sections/agreements/agreement/agreement.component';

export async function generateMetadata() {
  return {
    title: `Avtal - Privat - ${appName()}`,
  };
}

export default function Agreement() {
  return <AgreementComponent />;
}
