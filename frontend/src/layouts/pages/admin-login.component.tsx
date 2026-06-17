'use client';

import { Button, FormErrorMessage, Icon } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardElevated } from '@components/cards/card-elevated.component';
import { CenterDiv } from '@layouts/center-div.component';
import { EntryLayout } from '@layouts/entry-layout.component';
import Main from '../../layouts/main.component';
import { appURL } from '@utils/app-url';

function AdminLogin() {
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();

  const { t } = useTranslation(['common']);

  const failMessage = searchParams?.get('failMessage');

  const onLogin = () => {
    globalThis.location.assign(`${process.env.NEXT_PUBLIC_API_URL}/saml/admin/login?successRedirect=${appURL()}/admin`);
  };

  useEffect(() => {
    if (failMessage) {
      switch (failMessage) {
        case 'Not Authorized':
          break;
        case 'SAML_MISSING_GROUP':
          setErrorMessage(t('common:login.error.missingGroups'));
          break;
        case 'SAML_MISSING_ATTRIBUTES':
          setErrorMessage(t('common:login.error.missingAttributes'));
          break;
        case 'MISSING_PERMISSIONS':
          setErrorMessage(t('common:login.error.missingPermissions'));
          break;
        default:
          setErrorMessage(t('common:login.error.login'));
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EntryLayout title={t('common:logIn')}>
      <div className="w-full max-w-[64rem]">
        <CardElevated>
          <Main>
            <CenterDiv className="px-0 desktop:px-80 pt-32 pb-40 desktop:pb-56 gap-40">
              <div className="flex flex-col w-full gap-12">
                <h1 className="text-center text-h2-sm desktop:text-h2-lg m-0">{t('impersonation:adminLogin')}</h1>
                <p className="text-center text-secondary m-0 px-32">{t('impersonation:loginInternalAccount')}</p>
              </div>

              <div className="flex flex-col w-full gap-16">
                <Button
                  className="flex-grow"
                  variant="primary"
                  size="lg"
                  rightIcon={<Icon icon={<ArrowRight />} />}
                  onClick={onLogin}
                >
                  {t('impersonation:loginAsAdmin')}
                </Button>
                {errorMessage && <FormErrorMessage className="text-error mt-lg">{errorMessage}</FormErrorMessage>}
              </div>
            </CenterDiv>
          </Main>
        </CardElevated>
      </div>
    </EntryLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}
