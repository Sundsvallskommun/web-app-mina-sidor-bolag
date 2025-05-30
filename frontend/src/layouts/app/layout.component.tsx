'use client';

import { AppWrapper } from '@contexts/app.context';
import { ConfirmationDialogContextProvider, GuiProvider, extendTheme, toRGB } from '@sk-web-gui/react';
import { MatomoWrapper } from '@utils/matomo-wrapper';
import dayjs from 'dayjs';
import 'dayjs/locale/se';
import { i18n as i18nType } from 'i18next';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import '../../../tailwind.scss';
import { LoginGuard } from './login-guard';
import { useState, useEffect } from 'react';
import initLocalization from 'src/app/i18n';

dayjs.extend(utc);
dayjs.locale('se');
dayjs.extend(updateLocale);
dayjs.updateLocale('se', {
  months: [
    'Januari',
    'Februari',
    'Mars',
    'April',
    'Maj',
    'Juni',
    'Juli',
    'Augusti',
    'September',
    'Oktober',
    'November',
    'December',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  weekdaysMin: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
});

interface MyAppLayoutProps {
  children?: React.ReactNode;
  locale: string;
  namespaces: string[];
}

export default function MyAppLayout({ children, locale, namespaces }: MyAppLayoutProps) {
  const [i18n, seti18n] = useState<i18nType | null>(null);

  useEffect(() => {
    initLocalization(locale, namespaces).then((res) => {
      seti18n(res.i18n);
    });
  }, [locale, namespaces]);

  const theme = extendTheme({
    colorSchemes: {
      light: {
        colors: {
          brand: {
            primary: `rgb(${toRGB('#FAE9E7')?.join(',')})`,
            secondary: `rgb(${toRGB('#FFF0D9')?.join(',')})`,
          },
        },
      },
      dark: {
        colors: {
          brand: {
            primary: `rgb(${toRGB('#2F2E2E')?.join(',')})`,
            secondary: `rgb(${toRGB('#B39029')?.join(',')})`,
          },
        },
      },
    },
  });
  return (
    <html lang="sv">
      <body>
        <GuiProvider theme={theme}>
          <ConfirmationDialogContextProvider>
            <AppWrapper>
              <LoginGuard>
                <MatomoWrapper>{!!i18n && children}</MatomoWrapper>
              </LoginGuard>
            </AppWrapper>
          </ConfirmationDialogContextProvider>
        </GuiProvider>
      </body>
    </html>
  );
}
