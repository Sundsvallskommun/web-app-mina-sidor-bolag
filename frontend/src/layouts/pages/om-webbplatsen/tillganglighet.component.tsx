'use client';

import { Breadcrumb } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../../layouts/pages-breadcrumbs-layout.component';
import { Trans, useTranslation } from 'react-i18next';
import React from 'react';
import { NextLink } from '@sk-web-gui/next';

export default function Tillganglighet() {
  const { t } = useTranslation(['about', 'accessibility']);

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href={t('about:url')}>
              <Breadcrumb.Link variant="tertiary" as="span" href={t('about:url')}>
                {t('about:title')}
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href={t('accessibility:pageLink')}>{t('accessibility:title')}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <div className="text-content">
        <h1>{t('accessibility:title')}</h1>
        <div className="flex flex-col gap-y-40">
          <div className="text-lead">{t('accessibility:description')}</div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:subTitle')}</h2>
            <p>{t('accessibility:subDescription')}</p>
            <p>{t('accessibility:publishDate')}</p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:howAccessible')}</h2>
            <p>{t('accessibility:howAccessibleDescription')}</p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:reportTitle')}</h2>
            <p className="my-16">
              <Trans
                i18nKey="accessibility:reportDescription"
                components={{
                  Link: <NextLink href={t('accessibility:reportDescriptionUrl')} external />,
                }}
              />
            </p>
            <p>{t('accessibility:digitalReportContactTitle')}</p>
            <p>
              <Trans
                i18nKey="accessibility:digitalReportContactLink"
                components={{
                  Link: <NextLink href={t('accessibility:digitalReportContactUrl')} external />,
                }}
              />
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">{t('accessibility:oversight')}</h2>
            <p>{t('accessibility:oversightDescription')}</p>
            <p>
              <Trans
                i18nKey="accessibility:overSightLink"
                components={{
                  Link: <NextLink href={t('accessibility:oversightUrl')} external />,
                }}
              />
            </p>
          </div>
        </div>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
