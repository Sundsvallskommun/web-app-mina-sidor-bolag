import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Icon } from '@sk-web-gui/react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export const ExtendedViewBanner: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: user } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  return user?.isExtendingView ? (
    <div className="w-full bg-vattjom-background-200">
      <div className="flex py-20 container w-full m-auto justify-between">
        <div className="flex items-center">
          <Icon icon={<AlertCircle />} color="vattjom" />
          <p className="px-16 flex flex-grow">{t('impersonation:bannerInfo')}</p>
        </div>
        <Button size="md" onClick={() => router.push('/logout')}>
          {t('impersonation:exit')}
        </Button>
      </div>
    </div>
  ) : undefined;
};
