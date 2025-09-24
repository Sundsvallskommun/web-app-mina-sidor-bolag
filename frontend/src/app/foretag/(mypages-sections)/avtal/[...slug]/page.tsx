import { appName } from '@utils/app-name';
import { AgreementComponent } from '@layouts/pages/mypages-sections/agreements/agreement/agreement.component';

export async function generateMetadata() {
  return {
    title: `Avtal - Företag - ${appName()}`,
  };
}

export default async function Agreement() {
  return <AgreementComponent />;
}
