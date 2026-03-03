import { MouseEvent, useState } from 'react';
import CurrentAndClosedEligibilityPermissionsTable from './current-and-closed-permissions-table/current-and-closed-eligibility-permissions-table';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Badge, Button, Label, Spinner, Tabs, useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { CurrentAndClosedPermissionCard } from './current-and-closed-permissions-card-item/current-and-closed-permissions-card-item';
import { queryClient, useApi } from '@services/api-service';
import { EligablePartyPart, FullPermissionDto, PermissionRequestDto } from '@interfaces/eligibility';
import { eligibilityQueryKeys, handleEligibilityResponse } from '@services/permissions-service';

interface CurrentAndClosedEligibilityPermissionsProps {
  customerIds?: number[];
}

const CurrentAndClosedEligibilityPermissions = ({ customerIds }: CurrentAndClosedEligibilityPermissionsProps) => {
  const { t } = useTranslation('eligibility');
  const [activePanel, setActivePanel] = useState(0);
  const { isMinLg } = useThemeQueries();
  const headerLabel = (label: string) => t(`eligibility:permissions.table.header.${label}`);
  const formatDate = (date: string | null) =>
    date ? dayjs(date).format('YYYY-MM-DD') : t('eligibility:permissions.table.currentAndClosed.unknownDate');
  const snackBar = useSnackbar();

  const {
    data: permissions,
    isLoading,
    isFetching,
  } = useApi({
    url: '/bfus/eligable-party-permissions',
    queryKey: [eligibilityQueryKeys.currentAndClosedPermissions],
    method: 'get',
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    dataHandler: handleEligibilityResponse(['ongoing', 'denied', 'revoked', 'expired']),
  });

  const revokeMutation = useApi<PermissionRequestDto, Error, FullPermissionDto>({
    url: 'bfus/eligable-party-revoke-permission',
    method: 'post',
  });

  const handleRevokePermission = (p: EligablePartyPart) => async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await revokeMutation.mutateAsync({
        PermissionRequest: {
          EligablePartyId: p.EligablePartyId,
          ContractIdList: [p.ContractId],
        },
      });

      await queryClient.invalidateQueries({
        queryKey: [eligibilityQueryKeys.currentAndClosedPermissions],
      });
      snackBar({
        message: t('eligibility:permissions.table.currentAndClosed.snackBarMessage.success'),
        status: 'success',
      });
    } catch {
      snackBar({
        message: `${t('eligibility:permissions.table.currentAndClosed.snackBarMessage.error')}`,
        status: 'error',
      });
    }
  };

  if (isLoading || isFetching || !permissions) {
    return (
      <div className="w-full flex justify-center content-center p-24" data-cy="current-and-closed-permissions-loader">
        <Spinner />
      </div>
    );
  }

  const currentAndClosedPermissions: EligablePartyPart[] = Object.values(permissions).flat();

  const filterPermissions = (ongoing: boolean) =>
    currentAndClosedPermissions.filter((p) => (p.StatusCategory === 'ongoing') === ongoing);

  const tabs = [
    { ongoing: true, index: 0 },
    { ongoing: false, index: 1 },
  ];

  const closedLabel = (statusCategory: EligablePartyPart['StatusCategory']) => {
    return (
      <Label rounded inverted color={statusCategory === 'denied' ? 'error' : 'tertiary'}>
        {t(`eligibility:permissions.table.currentAndClosed.status.${statusCategory}`)}
      </Label>
    );
  };

  const revokeActionButton = (p: EligablePartyPart) =>
    activePanel === 0 ? (
      <Button variant="tertiary" size={isMinLg ? 'sm' : 'lg'} onClick={handleRevokePermission(p)} className="flex-1">
        {t('eligibility:permissions.table.currentAndClosed.revokeAction')}
      </Button>
    ) : (
      closedLabel(p.StatusCategory)
    );

  const handleEndDate = (p: EligablePartyPart) => {
    if (p.StatusCategory === 'revoked') return p.UserRevokedContractTime;
    if (p.StatusCategory === 'expired') return p.EndDay;
    if (p.StatusCategory === 'denied') return p.UserHandledTime;

    return p.UserHandledTime;
  };

  const permissionProps = {
    activePanel,
    headerLabel,
    formatDate,
    filterPermissions,
    revokeActionButton,
    handleEndDate,
  };

  return (
    <Tabs className="mt-64" underline data-cy="current-and-closed-permissions" onTabChange={setActivePanel}>
      {tabs.map(({ ongoing, index }) => {
        const items = filterPermissions(ongoing);
        return (
          <Tabs.Item key={index}>
            <Tabs.Button rightIcon={<Badge inverted={activePanel !== index} counter={items.length} />}>
              {t(`eligibility:permissions.${ongoing ? 'current' : 'closed'}`)}
            </Tabs.Button>
            <Tabs.Content>
              <p className="mb-16 mt-24">
                {t(`eligibility:permissions.description.${ongoing ? 'current' : 'closed'}`)}
              </p>
              {isMinLg ? (
                <CurrentAndClosedEligibilityPermissionsTable {...permissionProps} ongoing={ongoing} />
              ) : (
                <CurrentAndClosedPermissionCard {...permissionProps} ongoing={ongoing} />
              )}
            </Tabs.Content>
          </Tabs.Item>
        );
      })}
    </Tabs>
  );
};

export default CurrentAndClosedEligibilityPermissions;
