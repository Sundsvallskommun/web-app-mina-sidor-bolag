'use client';

import { ColorSchemeMode, cx, useGui } from '@sk-web-gui/react';
import { safeOrganizations } from '@utils/app-organizations';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface LogoGroupProps {
  height?: number;
  width?: number;
  wrapperClasses?: string;
  logoClasses?: string;
  organizations: string[];
}

export const LogoGroup: React.FC<LogoGroupProps> = (props) => {
  const { height, width, wrapperClasses, organizations, logoClasses } = props;
  const { colorScheme, preferredColorScheme } = useGui();
  const { t } = useTranslation('organization');

  const mode = colorScheme === ColorSchemeMode.System ? preferredColorScheme : colorScheme;

  return (
    <div className={cx('flex gap-24', wrapperClasses)}>
      {safeOrganizations(organizations)?.map((org) => (
        <Image
          src={`/logotypes/${org}-${mode}mode.svg`}
          alt={t(`organization:${org}.logo_alt`)}
          key={`logotype-${org}`}
          width={width}
          height={height}
          className={cx('w-auto', logoClasses)}
        />
      ))}
    </div>
  );
};
