import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { AICornerModule, useAssistantStore } from '@sk-web-gui/ai';
import { useThemeQueries } from '@sk-web-gui/react';
import React, { useEffect, useRef, useState } from 'react';
import { CornerAssistantState } from './components/corner-assistant-state.component';
import { RepresentingEntity, SessionStatusResponse } from '@data-contracts/backend/data-contracts';
import { useAppContext } from '@contexts/app.context';
import { useTranslation } from 'react-i18next';

export const CornerAssistant: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const interval = useRef<NodeJS.Timeout>(null);
  const { data: userData } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const { t } = useTranslation();
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });
  const { representingMode } = useAppContext();

  const { isMaxLargeDevice } = useThemeQueries();
  const [setSettings, setInfo, setApiBaseUrl, setStream, setApiKey, setApiServiceConfig] = useAssistantStore(
    (state) => [
      state.setSettings,
      state.setInfo,
      state.setApiBaseUrl,
      state.setStream,
      state.setApikey,
      state.setApiServiceConfig,
    ]
  );

  const { data: status, refetch: checkIsReady } = useApi<SessionStatusResponse>({
    url: `/ai/isReady`,
    method: 'get',
    queryKey: ['readyResponse'],
  });

  const isPending = !status || status?.status === 'PENDING';
  const isReady = status?.status === 'READY';
  const failed = status?.status === 'FAILED';

  useEffect(() => {
    setSettings({ assistantId: 'selfserviceai' });
    setApiBaseUrl(`${process.env.NEXT_PUBLIC_API_URL}/ai`);
    setStream(true);
    setApiKey('');
    setApiServiceConfig({ credentials: 'include' });
    setInfo({
      name: t('ai:info.name'),
      shortName: t('ai:info.shortName'),
      title: t('ai:info.title'),
      description: t('ai:info.description'),
      id: 'selfserviceai',
      avatar: '/ai/avatar.png',
    });
    setChecking(true);
    checkIsReady().finally(() => setChecking(false));

    interval.current = setInterval(async () => {
      if (!checking) {
        setChecking(true);
        await checkIsReady();
        setChecking(false);
      }
    }, 5000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userData?.relations?.customerRelations), JSON.stringify(representingEntity), representingMode]);

  useEffect(() => {
    if ((isReady || failed) && interval.current) {
      clearInterval(interval.current);
    }
  }, [isReady, failed]);

  return isReady ? (
    <AICornerModule
      data-cy="corner-assistant"
      isMobile={isMaxLargeDevice}
      disableFullscreen
      showNewSession={false}
      showFeedback={false}
      showSessionHistory={false}
    />
  ) : (
    <CornerAssistantState isMobile={isMaxLargeDevice} isPending={isPending} />
  );
};
