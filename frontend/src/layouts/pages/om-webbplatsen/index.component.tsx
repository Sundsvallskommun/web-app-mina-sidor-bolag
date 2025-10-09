'use client';

import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { Icon } from '@sk-web-gui/react';
import { ExternalLink } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ContentCardProps {
  title?: string;
  text?: string;
  href?: string;
  external?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, text, href, external }) => {
  return (
    <a
      href={href}
      target={external ? '_blank' : '_self'}
      className="p-24 shadow-50 bg-background-content rounded-cards focus:ring"
    >
      <div className="flex items-center">
        <h2 className="sk-link-lg underline">{title}</h2>
        {external && <Icon size={24} className="!pl-0" icon={<ExternalLink />} />}
      </div>
      <p className="text-small">{text}</p>
    </a>
  );
};

export default function OmWebbplatsen() {
  const { t } = useTranslation('about');

  return (
    <PagesBreadcrumbsLayout>
      <h1>{t('about:title')}</h1>

      <div className="mt-56 grid grid-cols-1 large-device:grid-cols-4 gap-24 justify-start">
        <ContentCard
          title={t('about:cookies.title')}
          text={t('about:cookies.text')}
          href={t('about:cookies.url')}
          external={false}
        />

        <ContentCard
          title={t('about:accessibility.title')}
          text={t('about:accessibility.text')}
          href={t('about:accessibility.url')}
          external={false}
        />

        <ContentCard
          title={t('about:5564786647.title')}
          text={t('about:5564786647.text')}
          href={t('about:5564786647.url')}
          external={true}
        />

        <ContentCard
          title={t('about:5565027223.title')}
          text={t('about:5565027223.text')}
          href={t('about:5565027223.url')}
          external={true}
        />
      </div>
    </PagesBreadcrumbsLayout>
  );
}
