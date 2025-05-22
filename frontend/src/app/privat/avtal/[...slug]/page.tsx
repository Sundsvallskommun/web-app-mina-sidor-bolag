import { appName } from '@utils/app-name';
import { AgreementComponent } from '@layouts/pages/mypages-sections/agreements/agreement/agreement.component';

export async function generateMetadata() {
  return {
    title: `Avtal - Privat - ${appName()}`,
  };
}

export default async function Agreement({
  params,
}: {
  params: Promise<{ slug: { category: string; facilityId: string } }>;
}) {
  const parameters = await params;

  if (!parameters) {
    return null;
  }
  return <AgreementComponent category={parameters.slug[0]} facilityId={parameters.slug[1]} />;
}
