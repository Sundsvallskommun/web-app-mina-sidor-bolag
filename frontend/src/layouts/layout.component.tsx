'use client';
import { useLocalStorageValue } from '@react-hookz/web';
import { CookieConsent, Footer } from '@sk-web-gui/react';
import Head from 'next/head';
import { NextLink } from '@sk-web-gui/next';
import { Logotypes } from '@components/logotypes/logotypes.component';
import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { useApi } from '@services/api-service';
import React, { useMemo } from 'react';

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const { set: setMatomo } = useLocalStorageValue('matomoIsActive');

  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const customerEngagements = useMemo(() => relations?.map((r) => r.organizationNumber ?? '') ?? [], [relations]);

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
        Hoppa till innehåll
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
                <Footer.ListItem className="text-label-medium">Kontakt</Footer.ListItem>

                <Footer.ListItem className="font-bold">Sundsvall Energi</Footer.ListItem>
                <Footer.ListItem>
                  Telefon:
                  <NextLink variant="tertiary" href={'tel:+46606005020'}>
                    060-600 50 20
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  Mail:
                  <NextLink variant="tertiary" href={'mailto:info@sundsvallelnat.se'}>
                    info@sundsvallelnat.se
                  </NextLink>
                </Footer.ListItem>

                <Footer.ListItem className="font-bold">Sundsvall Elnät</Footer.ListItem>
                <Footer.ListItem>
                  Telefon:
                  <NextLink variant="tertiary" href={'tel:060192200'}>
                    060-19 22 00
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  Mail:
                  <NextLink variant="tertiary" href={'mailto:kundservice@sundsvallenergi.se'}>
                    kundservice@sundsvallenergi.se
                  </NextLink>
                </Footer.ListItem>
              </Footer.List>

              <Footer.List>
                <Footer.ListItem className="text-label-medium">Om bolagen</Footer.ListItem>
                {customerEngagements.includes('5564786647') && (
                  <Footer.ListItem>
                    <NextLink variant="tertiary" external href={'https://sundsvallenergi.se/om-oss'}>
                      Om Sundsvall Energi
                    </NextLink>
                  </Footer.ListItem>
                )}
                {customerEngagements.includes('5565027223') && (
                  <Footer.ListItem>
                    <NextLink variant="tertiary" external href={'https://sundsvallelnat.se/om-oss/det-har-gor-vi'}>
                      Om Sundsvall Elnät
                    </NextLink>
                  </Footer.ListItem>
                )}
                <Footer.ListItem>
                  <NextLink
                    variant="tertiary"
                    external
                    href={
                      'https://sundsvall.se/kommun-och-politik/politik-och-demokrati/moten-och-protokoll/bolag-och-forbund/stadsbacken-ab'
                    }
                  >
                    Om Stadsbacken
                  </NextLink>
                </Footer.ListItem>
              </Footer.List>
              <Footer.List>
                <Footer.ListItem className="text-label-medium">Om innehållet</Footer.ListItem>
                <Footer.ListItem>
                  <NextLink variant="tertiary" href={'/om-webbplatsen'}>
                    Om webbplatsen
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink variant="tertiary" href={'/om-webbplatsen/kakor'}>
                    Kakor (Cookies)
                  </NextLink>
                </Footer.ListItem>
                <Footer.ListItem>
                  <NextLink variant="tertiary" href={'/om-webbplatsen/tillganglighet'}>
                    Tillgänglighet
                  </NextLink>
                </Footer.ListItem>
                {customerEngagements.includes('5564786647') && (
                  <Footer.ListItem>
                    <NextLink
                      variant="tertiary"
                      external
                      href={'https://sundsvallenergi.se/om-oss/detta-ar-vi/anvandarupplevelse/integritetspolicy'}
                    >
                      Personuppgifter Sundsvall Energi
                    </NextLink>
                  </Footer.ListItem>
                )}
                {customerEngagements.includes('5565027223') && (
                  <Footer.ListItem>
                    <NextLink
                      variant="tertiary"
                      external
                      href={'https://sundsvallelnat.se/om-oss/hantering-av-dina-personuppgifter'}
                    >
                      Personuppgifter Sundsvall Elnät
                    </NextLink>
                  </Footer.ListItem>
                )}
              </Footer.List>
            </Footer.ListWrapper>
          </Footer.Content>
        </Footer>
      </div>

      <CookieConsent
        title="Kakor på minasidor.stadsbacken.se"
        body={
          <p>
            Vi använder kakor, cookies, för att ge dig en förbättrad upplevelse, sammanställa statistik och för att viss
            nödvändig funktionalitet ska fungera på webbplatsen.{' '}
            <NextLink href="/om-webbplatsen/kakor" variant="tertiary">
              Läs mer om hur vi använder kakor
            </NextLink>
          </p>
        }
        cookies={[
          {
            optional: false,
            displayName: 'Nödvändiga kakor',
            description:
              'Dessa kakor är nödvändiga för att webbplatsen ska fungera och kan inte stängas av i våra system.',
            cookieName: 'necessary',
          },
          {
            optional: true,
            displayName: 'Kakor för statistik',
            description:
              'Dessa kakor tillåter oss att räkna besök och trafikkällor, så att vi kan mäta och förbättra prestanda på vår webbplats.',
            cookieName: 'stats',
          },
        ]}
        resetConsentOnInit={false}
        onConsent={cookieConsentHandler}
      />
    </>
  );
}
