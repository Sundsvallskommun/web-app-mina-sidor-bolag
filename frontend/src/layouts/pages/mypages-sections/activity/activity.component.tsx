'use client';

import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { Breadcrumb } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';

export const ActivityComponent = () => {
  const { t } = useTranslation(['activity', 'profile']);

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href="profil">
              <Breadcrumb.Link variant="body" as="span">
                {t('profile:title')}
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="./">{t('activity:title')}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <section className="flex flex-col gap-16">
        <h1 className="mb-0 text-display-3-md text-dark-primary">{t('activity:title')}</h1>
        <p className="m-0 text-large text-dark-primary font-normal">{t('activity:description')}</p>
      </section>
    </PagesBreadcrumbsLayout>
  );
};
