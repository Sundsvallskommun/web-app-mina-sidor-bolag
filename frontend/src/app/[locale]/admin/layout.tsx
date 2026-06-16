'use client';

import { Button, Header, Icon } from '@sk-web-gui/react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { LogoGroup } from '@components/logotypes/logo-group.component';
import { appOrganizations } from '@utils/app-organizations';
import { appName } from '@utils/app-name';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

/**
 * Minimal layout for the ADMIN representing mode. Unlike the citizen DefaultLayout it has
 * no Privat/Företag toggle and no citizen banners/footer, and it triggers none of the
 * citizen data calls (e.g. /myrelations) that would 401/500 for a non-citizen admin.
 */
export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const router = useRouter();

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
          Logga ut
        </Button>
      </Header>
      <main id="content" className="container mx-auto px-20 lg:px-32 py-40">
        {children}
      </main>
    </div>
  );
}
