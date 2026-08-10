import initLocalization from '@app/i18n';
import LocalizationProvider from '@components/localization-provider/localization-provider';
import { appName } from '@utils/app-name';
import { headers } from 'next/headers';
import { ReactNode } from 'react';

const namespaces = [
  'ai',
  'about',
  'accessibility',
  'activity',
  'agreement',
  'category',
  'common',
  'confirmation',
  'cookies',
  'citizen',
  'invoice',
  'layout',
  'notifications',
  'organization',
  'overview',
  'paths',
  'profile',
  'statistics',
  'bankid',
  'event',
  'consent',
  'impersonation',
  'disturbances',
];

export interface LocalizationLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const LocalizationLayout = async (props: LocalizationLayoutProps) => {
  const { params, children } = props;
  const { locale } = await params;
  const { resources } = await initLocalization(locale, namespaces);

  return <LocalizationProvider {...{ locale, resources, namespaces }}>{children}</LocalizationProvider>;
};

export const generateMetadata = async ({ params }: LocalizationLayoutProps) => {
  const { locale } = await params;
  const { t } = await initLocalization(locale ?? 'sv', namespaces);
  const path = (await headers()).get('x-path');

  const pathparts = path
    ?.replace(/^\/?/, '') // Remove leading slash
    .split('/') // Split into sections
    .reverse(); // Reverse

  const pathname = pathparts
    ?.map((part) => t(`paths:${part}.title`, { defaultValue: '' }))
    .filter((part) => !!part)
    .join(' - ');

  const getTitle = () => {
    if (path) {
      return `${pathname} - ${appName()}`;
    }
    return appName();
  };

  const description = pathparts?.[0] ? t(`paths:${pathparts?.[0]}.description`) : '';

  return {
    title: getTitle(),
    description,
  };
};

export default LocalizationLayout;
