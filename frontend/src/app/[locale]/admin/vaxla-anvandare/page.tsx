'use client';

import { Spinner } from '@sk-web-gui/react';
import ImpersonateUser from '@layouts/pages/mypages-sections/impersonate-user/impersonate-user.component';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { redirect } from 'next/navigation';

export default function VaxlaAnvandare() {
  const { data: user } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  if (!user) {
    return <Spinner className="mx-auto my-40" />;
  }

  if (!user.extendedView) {
    return redirect('/admin-login');
  }

  return <ImpersonateUser />;
}
