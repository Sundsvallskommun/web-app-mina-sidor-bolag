'use client';
import { useLocalStorageValue } from '@react-hookz/web';
import { CookieConsent, Footer } from '@sk-web-gui/react';
import Head from 'next/head';
import { NextLink } from '@sk-web-gui/next';
import { Logotypes } from '@components/logotypes/logotypes.component';
import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { useApi } from '@services/api-service';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CornerAssistant } from '@components/corner-assistant/corner-assistant.component';
import { User } from '@interfaces/user';

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { set: setMatomo } = useLocalStorageValue('matomoIsActive');
  const { t } = useTranslation(['common', 'layout', 'organization', 'cookies']);

  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const customerEngagements = useMemo(() => relations?.map((r) => r.organizationNumber ?? '') ?? [], [relations]);

  const { data: user } = useApi<User>({ url: '/me', method: 'get' });
  const ownsFacilities = useMemo(() => user?.facilities?.some((f) => !f.isDelegated) ?? [], [user?.facilities]);

  interface ConsentCookie {
    optional: boolean;
    displayName: string;
    description: string;
    cookieName: string;
  }

  const cookieConsentHandler = (cookies: ConsentCookie[]) => {
    if (cookies.some((opt) => opt.cookieName === 'stats')) {
      setMatomo(true);
    }
  };

  const setFocusToMain = () => {
    const contentElement = document.getElementById('content');
    contentElement?.focus();
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Mina Sidor Privat/Företag" />
        <meta name="theme-color" content="#00538a"></meta>
        <meta name="msapplication-navbutton-color" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="#00538a"></meta>
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"></meta>
      </Head>

      <NextLink
        onClick={setFocusToMain}
        className="sr-only focus:not-sr-only bg-primary-light border-2 border-black p-4 text-black inline-block focus:absolute focus:top-0 focus:left-0 focus:right-0 focus:m-auto focus:w-80 text-center"
        href="#content"
      >
        {t('layout:goToContent')}
      </NextLink>

      <div className="root-container">
        {children}
        <Footer className="bg-background-200">
          <Footer.Content>
            <Footer.LogoWrapper>
              <Logotypes height={50} width={100} />
            </Footer.LogoWrapper>
            <Footer.ListWrapper className="desktop:ml-80 gap-x-80 [&_.sk-footer-list-item]:w-full">
              <Footer.List>
                <Footer.ListItem className="text-label-medium">{t('layout:contact')}</Footer.ListItem>
                <Footer.ListItem className="font-bold">{t('organization:5564786647.name')}</Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="organization:5564786647.phone"
                    components={{
                      Link: <NextLink href={t('organization:5564786647.phoneNumber')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="organization:5564786647.email"
                    components={{
                      Link: <NextLink href={t('organization:5564786647.emailAddress')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>

                <Footer.ListItem className="font-bold">{t('organization:5565027223.name')}</Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="organization:5565027223.phone"
                    components={{
                      Link: <NextLink href={t('organization:5565027223.phoneNumber')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="organization:5565027223.email"
                    components={{
                      Link: <NextLink href={t('organization:5565027223.emailAddress')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>
              </Footer.List>

              <Footer.List>
                <Footer.ListItem className="text-label-medium"> {t('layout:about')}</Footer.ListItem>
                {customerEngagements.includes('5564786647') && (
                  <Footer.ListItem>
                    <Trans
                      i18nKey="organization:5564786647.about"
                      components={{
                        Link: <NextLink href={t('organization:5564786647.aboutUrl')} variant="tertiary" external />,
                      }}
                    />
                  </Footer.ListItem>
                )}
                {customerEngagements.includes('5565027223') && (
                  <Footer.ListItem>
                    <Trans
                      i18nKey="organization:5565027223.about"
                      components={{
                        Link: <NextLink href={t('organization:5565027223.aboutUrl')} variant="tertiary" external />,
                      }}
                    />
                  </Footer.ListItem>
                )}
                <Footer.ListItem>
                  <Trans
                    i18nKey="common:stadsbacken.about"
                    components={{
                      Link: <NextLink href={t('common:stadsbacken.aboutUrl')} variant="tertiary" external />,
                    }}
                  />
                </Footer.ListItem>
              </Footer.List>
              <Footer.List>
                <Footer.ListItem className="text-label-medium">{t('layout:aboutContent')}</Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="layout:aboutWeb"
                    components={{
                      Link: <NextLink href={t('layout:aboutWebUrl')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="layout:aboutCookies"
                    components={{
                      Link: <NextLink href={t('layout:aboutCookiesUrl')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>
                <Footer.ListItem>
                  <Trans
                    i18nKey="layout:aboutAccessibility"
                    components={{
                      Link: <NextLink href={t('layout:aboutAccessibilityUrl')} variant="tertiary" />,
                    }}
                  />
                </Footer.ListItem>

                {customerEngagements.includes('5564786647') && (
                  <Footer.ListItem>
                    <Trans
                      i18nKey="organization:5564786647.personalData"
                      components={{
                        Link: (
                          <NextLink href={t('organization:5564786647.personalDataUrl')} variant="tertiary" external />
                        ),
                      }}
                    />
                  </Footer.ListItem>
                )}
                {customerEngagements.includes('5565027223') && (
                  <Footer.ListItem>
                    <Trans
                      i18nKey="organization:5565027223.personalData"
                      components={{
                        Link: (
                          <NextLink href={t('organization:5565027223.personalDataUrl')} variant="tertiary" external />
                        ),
                      }}
                    />
                  </Footer.ListItem>
                )}
              </Footer.List>
            </Footer.ListWrapper>
          </Footer.Content>
        </Footer>
      </div>

      <CookieConsent
        title={t('cookies:consent.title')}
        body={
          <p>
            {t('cookies:consent.body')}
            <Trans
              i18nKey="cookies:consent.readMore"
              components={{
                Link: <NextLink href={t('cookies:consent.readMoreUrl')} variant="tertiary" />,
              }}
            />
          </p>
        }
        cookies={[
          {
            optional: false,
            displayName: t('cookies:consent.necessary.title'),
            description: t('cookies:consent.necessary.description'),
            cookieName: 'necessary',
          },
          {
            optional: true,
            displayName: t('cookies:consent.statistics.title'),
            description: t('cookies:consent.statistics.description'),
            cookieName: 'stats',
          },
        ]}
        resetConsentOnInit={false}
        onConsent={cookieConsentHandler}
      />
      {ownsFacilities && process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT === 'true' ? <CornerAssistant /> : null}
    </>
  );
}
