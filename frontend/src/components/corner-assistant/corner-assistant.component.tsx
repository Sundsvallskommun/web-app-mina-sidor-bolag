import React, { useEffect, useMemo } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useThemeQueries } from '@sk-web-gui/react';
import { AICornerModule, useAssistantStore, useChat } from '@sk-web-gui/ai';
import { SessionResponse } from '@data-contracts/backend/data-contracts';

export const CornerAssistant: React.FC = () => {
  const { isMaxLg } = useThemeQueries();

  const { data: userData } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });
  const ownsFacilities = useMemo(() => userData?.facilities?.some((f) => !f.isDelegated) ?? [], [userData?.facilities]);

  const {
    data: sessionData,
    mutateAsync: sessionMutateAsync,
    isPending,
  } = useApi<SessionResponse>({
    url: '/session',
    method: 'post',
    queryKey: ['session'],
    queryOptions: {
      enabled: false,
    },
  });

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

  const { session, sendQuery, newSession } = useChat({ sessionId: sessionData?.sessionId });

  const { data: isReady = false, refetch: checkIsReady } = useApi<boolean>({
    url: `/isReady/${sessionData?.sessionId}`,
    method: 'get',
    queryKey: ['readyResponse', sessionData?.sessionId ?? ''],
    queryOptions: {
      enabled: !!sessionData?.sessionId,
    },
  });

  useEffect(() => {
    if (ownsFacilities && !isPending) {
      sessionMutateAsync({}).then((res) => {
        if (!res.sessionId || !res.assistantId) return;
        setSettings({ assistantId: res?.assistantId });
        setApiBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? '');
        setStream(true);
        setApiKey('');
        setApiServiceConfig({ headers: { withCredentials: 'true' } });
        setInfo({
          name: 'Assistent',
          shortName: 'MS',
          title: 'Mina sidor Bolag',
          description: 'Har du frågor om dina avtal, fakturor eller statistik?',
          id: sessionData?.assistantId,
        });

        const interval = setInterval(async () => {
          const { data } = await checkIsReady();
          if (data) {
            clearInterval(interval);
          }
        }, 2000);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.relations?.customerRelations]);

  return isReady ? (
    <AICornerModule
      sessionId={sessionData?.sessionId}
      session={session}
      isMobile={isMaxLg}
      onNewSession={newSession}
      onSendQuery={sendQuery}
    />
  ) : null;
};
