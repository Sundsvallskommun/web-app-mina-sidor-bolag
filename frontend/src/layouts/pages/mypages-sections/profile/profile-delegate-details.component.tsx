'use client';

import ContentCard, { ContentCardBody, ContentCardHeader } from '@components/content-card/content-card';
import { ClientContactSetting, DelegatedContactSetting } from '@interfaces/contactsettings';
import { useApi, useApiService } from '@services/api-service';
import { useEffect, useState } from 'react';
import { DelegateItem } from './components/delegate-item.component';
import { Button, Icon } from '@sk-web-gui/react';
import { Pen, X } from 'lucide-react';

export const DelegatedContactDetails = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const [newItem, setNewItem] = useState(false);

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
        email_disabled: true,
        phone_disabled: false,
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
  }, [isError]);

  return (
    <ContentCard>
      <ContentCardHeader>
        <h2 className="text-h4-sm medium-device:text-h4-lg mb-0">
          <div className="flex items-center gap-md">
            <span>Anpassade aviseringar</span>
          </div>
        </h2>
      </ContentCardHeader>

      <ContentCardBody>
        {!isError && delegatedContactSettings?.length ? (
          delegatedContactSettings
            .sort((a, b) => {
              if (a.contactSetting.alias && b.contactSetting.alias) {
                return a.contactSetting.alias.localeCompare(b.contactSetting.alias);
              }
              return 0;
            })
            .map((delegatedContactSetting) => (
              <DelegateItem
                key={delegatedContactSetting?.delegate?.id}
                delegatedContactSetting={delegatedContactSetting}
              />
            ))
        ) : (
          <p>Inga anpassade aviseringar tillagda.</p>
        )}

        {newItem ? (
          <DelegateItem
            delegatedContactSetting={emptyDelegatedContactSetting}
            newItem
            close={() => {
              setNewItem(false);
            }}
          />
        ) : (
          <Button
            size="md"
            variant="tertiary"
            showBackground={true}
            leftIcon={<Icon icon={newItem ? <X /> : <Pen />} />}
            onClick={() => setNewItem(true)}
          >
            Lägg till anpassad avisering
          </Button>
        )}
      </ContentCardBody>
    </ContentCard>
  );
};
