import { MouseEvent, useState } from 'react';
import CurrentAndClosedConsentsTable from './current-and-closed-consents-table/current-and-closed-consents-table';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Badge, Button, Label, Tabs, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { CurrentAndClosedConsentsCard } from './current-and-closed-consents-card-item/current-and-closed-consents-card-item';
import { queryClient, useApi } from '@services/api-service';
import { Consent, FullConsentDto, ConsentRequestDto } from '@interfaces/consent';
import { consentQueryKeys } from '@services/consent-service';

interface CurrentAndClosedConsentsProps {
  current: Consent[];
  closed: Consent[];
  customerIds: number[];
}

const CurrentAndClosedConsents = ({ current, closed, customerIds }: CurrentAndClosedConsentsProps) => {
  const { t } = useTranslation('consent');
  const [activePanel, setActivePanel] = useState(0);
  const { isMinLg } = useThemeQueries();
  const headerLabel = (label: string) => t(`consent:consents.table.header.${label}`);
  const formatDate = (date: string | null) =>
    date ? dayjs(date).format('YYYY-MM-DD') : t('consent:consents.table.currentAndClosed.unknownDate');
  const snackBar = useSnackbar();

  const revokeMutation = useApi<ConsentRequestDto, Error, FullConsentDto>({
    url: 'bfus/consent/revoke',
    method: 'post',
    mutationOptions: {
      onSuccess: () => {
        queryClient.refetchQueries({
          queryKey: [consentQueryKeys.consents, customerIds],
        });
      },
    },
  });

  const handleRevokeConsent = (p: Consent) => async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await revokeMutation.mutateAsync({
        PermissionRequest: {
          EligablePartyId: p.EligablePartyId,
          ContractIdList: [p.ContractId],
        },
      });

      snackBar({
        message: t('consent:consents.table.currentAndClosed.snackBarMessage.success'),
        status: 'success',
      });
    } catch {
      snackBar({
        message: `${t('consent:consents.table.currentAndClosed.snackBarMessage.error')}`,
        status: 'error',
      });
    }
  };

  const filterConsents = (ongoing: boolean) => (ongoing ? current : closed);

  const tabs = [
    { ongoing: true, index: 0 },
    { ongoing: false, index: 1 },
  ];

  const closedLabel = (statusCategory: Consent['StatusCategory']) => {
    return (
      <Label rounded inverted color={statusCategory === 'denied' ? 'error' : 'tertiary'}>
        {t(`consent:consents.table.currentAndClosed.status.${statusCategory}`)}
      </Label>
    );
  };

  const revokeActionButton = (p: Consent) =>
    activePanel === 0 ? (
      <Button
        variant="tertiary"
        size={isMinLg ? 'sm' : 'lg'}
        onClick={handleRevokeConsent(p)}
        className="flex-1"
        data-cy="revoke-button"
      >
        {t('consent:consents.table.currentAndClosed.revokeAction')}
      </Button>
    ) : (
      closedLabel(p.StatusCategory)
    );

  const handleEndDate = (p: Consent) => {
    if (p.StatusCategory === 'revoked') return p.UserRevokedContractTime;
    if (p.StatusCategory === 'expired') return p.EndDay;
    if (p.StatusCategory === 'denied') return p.UserHandledTime;

    return p.UserHandledTime;
  };

  const permissionProps = {
    activePanel,
    headerLabel,
    formatDate,
    filterConsents,
    revokeActionButton,
    handleEndDate,
  };

  return (
    <Tabs className="mt-64" underline data-cy="current-and-closed-consents" onTabChange={setActivePanel}>
      {tabs.map(({ ongoing, index }) => {
        const items = ongoing ? current : closed;
        return (
          <Tabs.Item key={index}>
            <Tabs.Button rightIcon={<Badge inverted={activePanel !== index} counter={items.length} />}>
              {t(`consent:consents.${ongoing ? 'current' : 'closed'}`)}
            </Tabs.Button>
            <Tabs.Content>
              <p className="mb-16 mt-24">{t(`consent:consents.description.${ongoing ? 'current' : 'closed'}`)}</p>
              {isMinLg ? (
                <CurrentAndClosedConsentsTable {...permissionProps} ongoing={ongoing} />
              ) : (
                <CurrentAndClosedConsentsCard {...permissionProps} ongoing={ongoing} />
              )}
            </Tabs.Content>
          </Tabs.Item>
        );
      })}
    </Tabs>
  );
};

export default CurrentAndClosedConsents;
