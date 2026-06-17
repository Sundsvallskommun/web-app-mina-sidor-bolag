'use client';

import { Button, Icon } from '@sk-web-gui/react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: user } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-32 max-w-[64rem]">
      <div className="flex flex-col gap-8">
        <h1 className="text-h2-sm desktop:text-h2-lg m-0">{t('impersonation:administration')}</h1>
        <p className="text-secondary m-0">{t('impersonation:loggedInAs', { user: user?.name })}</p>
      </div>

      <div className="bg-background-content rounded-cards shadow-50 p-32 flex flex-col gap-16 w-fit">
        <h2 className="text-h4-sm m-0">{t('impersonation:title')}</h2>
        <p className="m-0">{t('impersonation:mainDescription')}</p>
        <Button
          variant="primary"
          rightIcon={<Icon icon={<ArrowRight />} />}
          onClick={() => router.push('/admin/vaxla-anvandare')}
          data-cy="admin-impersonate-link"
        >
          {t('impersonation:title')}
        </Button>
      </div>
    </div>
  );
}
