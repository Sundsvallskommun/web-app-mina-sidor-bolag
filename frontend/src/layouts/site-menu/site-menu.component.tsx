'use client';

import { useAppContext } from '@contexts/app.context';
import { MyPagesBusinessSwitch, MyPagesToggle } from './site-menu-items';
import { UserMenu } from '@layouts/user-menu/user-menu.component';

export const SiteMenu = () => {
  const { isRepresentingModeBusiness } = useAppContext();

  return (
    <nav aria-label="Site menu" className="flex items-center">
      <ul className="flex items-center gap-40">
        {isRepresentingModeBusiness && (
          <li>
            <MyPagesBusinessSwitch />
          </li>
        )}
        <li>
          <MyPagesToggle />
        </li>

        <li>
          <UserMenu />
        </li>
      </ul>
    </nav>
  );
};
