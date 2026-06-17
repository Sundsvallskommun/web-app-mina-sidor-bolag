'use client';

import { Button, Header, Icon } from '@sk-web-gui/react';
import { LogOut } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { LogoGroup } from '@components/logotypes/logo-group.component';
import { appOrganizations } from '@utils/app-organizations';
import { appName } from '@utils/app-name';
import { useTranslation } from 'react-i18next';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import FullscreenMainSpinner from '@components/spinner/fullscreen-main-spinner.component';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const { data: user } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return <FullscreenMainSpinner />;
  }

  if (!user?.extendedView) {
    return redirect('/admin-login');
  }

  return (
    <div className="root-container">
      <Header
        wrapperClasses="py-16"
        title={appName()}
        logo={<LogoGroup organizations={appOrganizations} height={50} width={100} />}
      >
        <Button
          variant="tertiary"
          rightIcon={<Icon icon={<LogOut />} />}
          onClick={() => router.push('/admin-logout')}
          data-cy="admin-logout-button"
        >
          {t('common:logout.logout')}
        </Button>
      </Header>
      <main id="content" className="container mx-auto px-20 lg:px-32 py-40">
        {children}
      </main>
    </div>
  );
}
