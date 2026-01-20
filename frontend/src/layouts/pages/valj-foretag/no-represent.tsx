import EmptyLayout from '@layouts/empty-layout.component';
import { Button } from '@sk-web-gui/react';
import { useRouter } from 'next/navigation';
import { appURL } from '@utils/app-url';
import { RepresentingMode } from '@interfaces/app';
import { useRepresentingSwitch } from '@layouts/site-menu/site-menu-items';
import { useTranslation } from 'react-i18next';
import React from 'react';

export const NoRepresent: React.FC = ({}) => {
  const router = useRouter();
  const { setRepresenting } = useRepresentingSwitch();
  const { t } = useTranslation('common');

  const onLogout = () => {
    // NOTE: send user to logout with SSO
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/saml/logout?successRedirect=${`${appURL()}/login?loggedout`}`); // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const onGoBack = async () => {
    const res = await setRepresenting({ mode: RepresentingMode.PRIVATE });
    if (!res.error) {
      router.push('/privat/oversikt');
    }
  };

  return (
    <EmptyLayout title="Mina Sidor - Logga In">
      <div className="flex items-center justify-center min-h-screen bg-background-100">
        <div className="max-w-[68rem] p-24 shadow-lg rounded-cards bg-background-content border-1 border-divider">
          <div className="mb-14">
            <h1 className="text-xl">{t('common:noRepresent.title')}</h1>

            <p className="my-0">{t('common:noRepresent.description')}</p>
          </div>

          <Button variant="secondary" className="w-full my-16" onClick={() => onGoBack()}>
            {t('common:noRepresent.goBack')}
          </Button>

          <Button className="w-full" onClick={() => onLogout()} data-cy="loginButton">
            {t('common:logout.logout')}
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
};
