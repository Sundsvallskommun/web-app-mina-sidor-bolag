'use client';

import { useTranslation } from 'react-i18next';
import { queryClient, useApi } from '@services/api-service';
import { pendingEligibilityHandler } from '@services/new-permissions-service';
import { NewPermissionListItem } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permission-list-item/new-permission-list-item.component';
import React from 'react';
import { useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { NewPermissionCardItem } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permission-card-item/new-permission-card-item.component';
import { EligablePartyPart, PermissionRequestDto } from '@interfaces/eligibility';

interface NewPermissionsProps {
  customerIds: number[];
}

type PermissionMutationOptions<TPayload> = {
  payload: TPayload;
  mutation: {
    mutateAsync: (payload: TPayload) => Promise<unknown>;
  };
  successMessage: string;
  errorMessage: string;
};

export const NewPermissions = (props: NewPermissionsProps) => {
  const { customerIds } = props;
  const { t } = useTranslation(['common', 'eligibility']);
  const { isMinLg } = useThemeQueries();

  const snackBar = useSnackbar();

  const grantPermission = useApi({
    url: '/bfus/eligable-party-grant-permission',
    method: 'post',
  });
  const denyPermission = useApi({
    url: `/bfus/eligable-party-deny-permission`,
    method: 'post',
  });

  const { data: newPermissions } = useApi({
    url: '/bfus/eligable-party-permissions',
    queryKey: ['new-permissions'],
    method: 'get',
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    dataHandler: pendingEligibilityHandler,
  });

  const handlePermissionMutation = async ({
    payload,
    mutation,
    successMessage,
    errorMessage,
  }: PermissionMutationOptions<PermissionRequestDto>) => {
    try {
      await mutation.mutateAsync(payload);

      await queryClient.invalidateQueries({
        queryKey: ['new-permissions'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['bfus-eligible-party-permissions'],
      });
      snackBar({
        message: successMessage,
        status: 'success',
      });
    } catch {
      snackBar({
        message: errorMessage,
        status: 'error',
      });
    }
  };

  const handleApprovePermission = async (contractIds: number[], eligablePartyId: string) => {
    await handlePermissionMutation({
      payload: {
        PermissionRequest: {
          ContractIdList: contractIds,
          EligablePartyId: eligablePartyId,
        },
      },
      mutation: grantPermission,
      successMessage: t('eligibility:permissions.item.approveSuccess'),
      errorMessage: t('eligibility:permissions.item.approveError'),
    });
  };

  const handleDenyPermission = async (customerId: number, eligablePartyId: string) => {
    await handlePermissionMutation({
      payload: {
        PermissionRequest: {
          CustomerId: customerId,
          EligablePartyId: eligablePartyId,
        },
      },
      mutation: denyPermission,
      successMessage: t('eligibility:permissions.item.denySuccess'),
      errorMessage: t('eligibility:permissions.item.denyError'),
    });
  };

  if (!newPermissions || Object.keys(newPermissions).length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="leading-h3-lg">{t('eligibility:permissions.new')}</h3>
      <p className="pt-8">{t('eligibility:permissions.description.new')}</p>
      {...Object.entries(newPermissions).map(([company, permissions]: [string, EligablePartyPart[]]) => {
        const commonProps = {
          company,
          permissions,
          handleApprovePermission,
          handleDenyPermission,
        };

        return isMinLg ? (
          <NewPermissionListItem {...commonProps} key={company} />
        ) : (
          <NewPermissionCardItem {...commonProps} key={company} />
        );
      })}
    </div>
  );
};
