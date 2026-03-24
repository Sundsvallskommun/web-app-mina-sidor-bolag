import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { AICornerModule, useAssistantStore } from '@sk-web-gui/ai';
import { useThemeQueries } from '@sk-web-gui/react';
import React, { useEffect, useRef, useState } from 'react';
import { CornerAssistantLoading } from './components/corner-assistant-loading.component';
import { RepresentingEntity } from '@data-contracts/backend/data-contracts';
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

  if (process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT === 'false') return null;

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

  const { data: isReady = false, refetch: checkIsReady } = useApi<boolean>({
    url: `/ai/isReady`,
    method: 'get',
    queryKey: ['readyResponse'],
  });

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
    if (isReady && interval.current) {
      clearInterval(interval.current);
    }
  }, [isReady]);

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
    <CornerAssistantLoading isMobile={isMaxLargeDevice} />
  );
};
