import NextLink from 'next/link';
import { useAppContext } from '../../contexts/app.context';
import { getRepresentingModeRoute } from '../../utils/representingModeRoute';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import { useThemeQueries } from '@sk-web-gui/react';

export const useBannerMenuItems = () => {
  const { representingMode } = useAppContext();
  const myPagesRoute = getRepresentingModeRoute(representingMode);
  const { t } = useTranslation('common');

  const { isMinDesktop } = useThemeQueries();

  const bannerItems = [
    <NextLink
      key={`banner-menu-item-0`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/oversikt`}
    >
      {capitalize(t('common:overview'))}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-1`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/avtal`}
    >
      {capitalize(t('common:agreement'))}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-2`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/statistik`}
    >
      {capitalize(t('common:statistics'))}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-3`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/fakturor`}
    >
      {capitalize(t('common:invoices'))}
    </NextLink>,
    <NextLink
      key={`banner-menu-item-4`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/sjalvservice`}
    >
      {capitalize(t('common:selfService'))}
    </NextLink>,
  ];
  const mobileMenuItems = [
    ...bannerItems,
    <NextLink
      key={`banner-menu-item-5`}
      className="w-full flex items-center justify-center"
      href={`${myPagesRoute}/profil`}
    >
      {capitalize(t('common:profile'))}
    </NextLink>,
    <>
      {/* NOTE: Don't show in production */}
      {process.env.NODE_ENV !== 'production' && (
        <NextLink
          key={`banner-menu-item-5`}
          className="w-full flex items-center justify-center"
          href={`${myPagesRoute}/medgivanden`}
        >
          {capitalize(t('common:eligibility'))}
        </NextLink>
      )}
    </>,
  ];

  return isMinDesktop ? bannerItems : mobileMenuItems;
};
