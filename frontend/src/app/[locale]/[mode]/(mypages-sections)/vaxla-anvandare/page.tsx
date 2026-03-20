'use client';
import { PagesLayout } from '@layouts/pages-layout.component';
import ImpersonateUser from '@layouts/pages/mypages-sections/impersonate-user/impersonate-user.component';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { redirect } from 'next/navigation';

export default function VaxlaAnvandare() {
  const { data: user } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  return user?.extendedView ? (
    <PagesLayout>
      <ImpersonateUser />
    </PagesLayout>
  ) : (
    redirect('/oversikt')
  );
}
