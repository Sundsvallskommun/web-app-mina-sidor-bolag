'use client';

import { MenuBar, cx, useThemeQueries } from '@sk-web-gui/react';
import { usePathname } from 'next/navigation';
import { useBannerMenuItems } from './banner-menu-items';
import { useAppContext } from '@contexts/app.context';
import { titleCase } from '@utils/title-caser';

export const BannerMenu: React.FC = () => {
  const pathname = usePathname();
  const bannerMenuItems = useBannerMenuItems();
  const { isMinDesktop } = useThemeQueries();
  const { representingName: representingLabel } = useAppContext();

  return (
    <div className="w-full bg-brand-primary">
      <div className="max-w-content mx-auto relative overflow-hidden">
        <div className="max-w-main-content z-10 relative mx-auto pl-20 lg:pl-0 pt-[6rem] pl- flex flex-col items-start">
          <span className="text-dark-secondary text-h3 font-header">Mina sidor</span>
          <span
            data-cy="representingLabel"
            className={cx('text-display-3-sm text-dark-primary lg:text-display-2-md xs:mb-32 lg:mb-48')}
          >
            {titleCase(representingLabel)}
          </span>
          {isMinDesktop && (
            <MenuBar className="self-stretch" aria-label={`Undersidor ${representingLabel}`}>
              {bannerMenuItems.map((item, index) => (
                <MenuBar.Item
                  key={`${index}`}
                  className="flex items-center justify-center grow"
                  current={pathname?.includes(item.props.href)}
                >
                  {item}
                </MenuBar.Item>
              ))}
            </MenuBar>
          )}
        </div>
      </div>
    </div>
  );
};
