'use client';

import { NextLink } from '@sk-web-gui/next';
import { Button, FormErrorMessage, Icon } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CardElevated } from '../../components/cards/card-elevated.component';
import { CenterDiv } from '../../layouts/center-div.component';
import { EntryLayout } from '../../layouts/entry-layout.component';
import Main from '../../layouts/main.component';
import { appURL } from '../../utils/app-url';
import { getAdjustedPathname, getRepresentingModeRoute } from '../../utils/representingModeRoute';
import { RepresentingMode } from '@interfaces/app';

function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();

  const { t } = useTranslation(['common', 'organization']);

  const isLoggedOut = searchParams?.get('loggedout') === '';
  const failMessage = searchParams?.get('failMessage');

  // Turn on/off automatic login
  const autoLogin = false;

  const onLogin = useCallback(
    (representingMode: RepresentingMode) => {
      // NOTE: send user to login with SSO
      const path = searchParams?.get('path') || '';
      const myPagesAdjustedPathname =
        getAdjustedPathname(path, representingMode) || getRepresentingModeRoute(representingMode);
      router.push(
        `${process.env.NEXT_PUBLIC_API_URL}/saml/login?successRedirect=${`${appURL()}${myPagesAdjustedPathname}&representingMode=${representingMode}`}`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  useEffect(() => {
    if (isLoggedOut) {
      //
    } else {
      if (!failMessage && autoLogin) {
        // autologin
        onLogin(RepresentingMode.PRIVATE);
      } else if (failMessage) {
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
          //
        }
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
              {isLoggedOut ? (
                <>
                  <div className="flex flex-col w-full gap-12">
                    <h1 className="text-center text-h2-sm desktop:text-h2-lg m-0">{t('common:logout.title')}</h1>

                    <p className="text-center text-secondary m-0">
                      <Trans
                        i18nKey="common:logout.description"
                        components={{
                          LinkOne: <NextLink href={t('organization:5564786647.url')} external />,
                          LinkTwo: <NextLink href={t('organization:5565027223.url')} external />,
                        }}
                      />
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <Button variant="primary" size="md" onClick={() => router.push('/login')}>
                      {t('common:logout.loginAgain')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col w-full gap-12">
                    <h1 className="text-center text-h2-sm desktop:text-h2-lg m-0">{t('common:login.title')}</h1>

                    <p className="text-center text-secondary m-0">{t('common:login.description')}</p>
                  </div>

                  <div className="flex flex-col w-full gap-16">
                    <p className="text-center text-label-large m-0">{t('common:login.loginAs')}</p>

                    <div className="flex flex-col desktop:flex-row gap-24 w-full">
                      <Button
                        className="flex-grow"
                        variant="secondary"
                        size="lg"
                        rightIcon={<Icon icon={<ArrowRight />} />}
                        onClick={() => onLogin(RepresentingMode.PRIVATE)}
                      >
                        {t('common:person')}
                      </Button>
                      {/* NOTE: Link to old service temporary */}
                      <Button
                        className="flex-grow"
                        variant="secondary"
                        size="lg"
                        rightIcon={<Icon icon={<ArrowRight />} />}
                        onClick={() => onLogin(RepresentingMode.BUSINESS)}
                      >
                        {t('common:organization')}
                      </Button>
                    </div>
                    {errorMessage && <FormErrorMessage className="text-error mt-lg">{errorMessage}</FormErrorMessage>}
                  </div>
                </>
              )}
            </CenterDiv>
          </Main>
        </CardElevated>
      </div>
    </EntryLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
