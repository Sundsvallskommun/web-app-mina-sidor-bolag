'use client';

import { Header, useThemeQueries } from '@sk-web-gui/react';
import { Layout } from './layout.component';
import { SiteMenu } from './site-menu/site-menu.component';
import { MobileMenu } from './mobile-menu/mobile-menu.component';
import { appName } from '@utils/app-name';
import React from 'react';
import { Logotypes } from '@components/logotypes/logotypes.component';
import { AlertBanner } from '@components/alert-banner/alert-banner.component';
import { ReferralBanner } from '@components/referral-banner/referral-banner.component';

interface DefaultLayoutProps {
  children?: React.ReactNode;
}

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const { isMinDesktop } = useThemeQueries();

  return (
    <Layout title={`${appName()}`}>
      <Header
        wrapperClasses="py-16 [&_.sk-header-mobilemenu]:md:block [&_.sk-header-mobilemenu]:desktop:hidden"
        title={appName()}
        mobileMenu={<MobileMenu />}
        logo={<Logotypes height={50} width={100} />}
      >
        {isMinDesktop && <SiteMenu />}
      </Header>
      <AlertBanner />
      <ReferralBanner />
      {children}
    </Layout>
  );
};
