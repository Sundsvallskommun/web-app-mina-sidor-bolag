'use client';

import { useAppContext } from '@contexts/app.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { appURL } from '../../../utils/app-url';

export default function AdminLogout() {
  const { resetContextDefaults } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    resetContextDefaults();
    localStorage.clear();
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/saml/admin/logout`);
    url.searchParams.set('successRedirect', `${appURL()}/admin-login?loggedout`);
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
