'use client';

import { Breadcrumb, Button, CookieConsentUtils } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../../layouts/pages-breadcrumbs-layout.component';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Kakor() {
  const { t } = useTranslation(['about', 'cookies']);

  const handleCookies = () => {
    CookieConsentUtils.resetConsent();
    location.reload();
  };

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href={t('about:url')}>
              <Breadcrumb.Link variant="body" as="span" href={t('about:url')}>
                {t('about:title')}
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href={t('about:cookies.url')}>{t('about:cookies.title')}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <div className="text-content">
        <h1>{t('about:cookies.title')}</h1>
        <div className="flex flex-col gap-y-40">
          <div className="text-lead">{t('cookies:areStored')}</div>
          <div>
            <p>{t('cookies:whatIs')}</p>
            <p>{t('cookies:onVisit')}</p>
            <p>{t('cookies:necessary')}</p>
            <p>{t('cookies:analytic')}</p>
            <p>{t('cookies:functionality')}</p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('cookies:necessaryCookies.title')}</h2>
            <p>
              {t('cookies:necessaryCookies.skCookie.name')}
              <br />
              {t('cookies:necessaryCookies.skCookie.usedBy')}
              <br />
              {t('cookies:necessaryCookies.skCookie.type')}
              <br />
              {t('cookies:necessaryCookies.skCookie.description')}
            </p>
            <p>
              {t('cookies:necessaryCookies.sid.name')}
              <br />
              {t('cookies:necessaryCookies.sid.userBy')}
              <br />
              {t('cookies:necessaryCookies.sid.type')}
              <br />
              {t('cookies:necessaryCookies.sid.description')}
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('cookies:handle')}</h2>
            <p className="my-16">{t('cookies:handleText')}</p>
            <Button className="mt-16" onClick={handleCookies}>
              {t('cookies:handleButtonText')}
            </Button>
          </div>
        </div>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
