'use client';

import { useApi, useApiService } from '@services/api-service';
import { useEffect, useState } from 'react';
import { DelegateItem } from './components/delegate-item.component';
import { useTranslation } from 'react-i18next';

export const DelegatedContactDetails = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const [, setNewItem] = useState(false);
  const { t } = useTranslation('profile');

  const { data: mainContactsetting, isError } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });

  const { data: delegatedContactSettings } = useApi<DelegatedContactSetting[]>({
    url: `/delegates/${mainContactsetting?.id ?? ''}`,
    method: 'get',
    queryKey: ['delegates', mainContactsetting?.id ?? ''],
  });

  const emptyDelegatedContactSetting: DelegatedContactSetting = {
    contactSetting: {
      name: '',
      email: '',
      alias: '',
      createdById: mainContactsetting?.id ?? '',
      virtual: true,
      phone: '',
      notifications: {
        email_enabled: true,
        phone_enabled: false,
      },
    },
    delegate: {
      principalId: mainContactsetting?.id ?? '',
      agentId: undefined,
      filters: [],
    },
  };

  useEffect(() => {
    if (isError) {
      queryClient.setQueryData(['contactsetting'], undefined);
      queryClient.setQueryData(['delegates'], []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  return (
    <div className="mx-8">
      <div>
        <h2 className="text-h4-sm medium-device:text-h4-lg mb-0">
          <div className="flex items-center gap-md">
            <span>{t('notifications:customized.title')}</span>
          </div>
        </h2>
      </div>

      <div>
        {!isError && delegatedContactSettings?.length ? (
          delegatedContactSettings
            .sort((a: DelegatedContactSetting, b: DelegatedContactSetting) => {
              if (a.contactSetting.alias && b.contactSetting.alias) {
                return a.contactSetting.alias.localeCompare(b.contactSetting.alias);
              }
              return 0;
            })
            .map((delegatedContactSetting: DelegatedContactSetting) => (
              <DelegateItem
                key={delegatedContactSetting?.delegate?.id}
                delegatedContactSetting={delegatedContactSetting}
                close={() => setNewItem(false)}
              />
            ))
        ) : (
          <p className="pb-12">{t('notifications:customized.none')}</p>
        )}
      </div>

      <DelegateItem
        delegatedContactSetting={emptyDelegatedContactSetting}
        newItem={true}
        close={() => {
          setNewItem(false);
        }}
      />
    </div>
  );
};
