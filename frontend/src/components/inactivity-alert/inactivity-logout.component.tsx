'use client';

import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { InactivityAlert } from './inactivity-alert.component';

export const InactivityLogout: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { error: userError, isFetching: userIsFetching } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const handleLogout = useCallback(() => {
    router.push('/logout');
  }, [router]);

  return (
    <InactivityAlert onLogout={handleLogout} enabled={!userIsFetching && !userError && !pathname?.includes('logout')} />
  );
};
