'use client';

import React, { useEffect, Fragment, Suspense, useState } from 'react';
import { push, trackAppRouter } from '@socialgouv/matomo-next';
import { usePathname, useSearchParams } from 'next/navigation';

import { useLocalStorageValue } from '@react-hookz/web';
import { appURL } from './app-url';

function MatomoRouteTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!pathname) return;
    const url = appURL() + pathname + (searchParamsString ? '?' + searchParamsString : '');
    push(['setCustomUrl', url]);
    push(['trackPageView']);
    push(['enableLinkTracking']);
  }, [pathname, searchParamsString]);

  return null;
}

interface MatomoWrapperProps {
  children?: React.ReactNode;
}

export function MatomoWrapper({ children }: MatomoWrapperProps) {
  const localstorageKey = 'matomoIsActive';
  const { value: matomo } = useLocalStorageValue(localstorageKey, {
    defaultValue: false,
    initializeWithValue: true,
  });
  const [haveInit, setHaveInit] = useState(false);

  const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
  const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  useEffect(() => {
    if (matomo && !haveInit) {
      trackAppRouter({ url: `${MATOMO_URL}`, siteId: `${MATOMO_SITE_ID}` });
      setHaveInit(true);
    }

    // If deactivate reload site (there is no de-init)
    if (haveInit && !matomo) {
      location.reload();
    }
  }, [MATOMO_SITE_ID, MATOMO_URL, haveInit, matomo]);

  return (
    <Fragment>
      <Suspense fallback={null}>{matomo && <MatomoRouteTracker />}</Suspense>
      {children}
    </Fragment>
  );
}
