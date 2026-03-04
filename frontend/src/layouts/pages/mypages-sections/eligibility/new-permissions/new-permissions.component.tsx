'use client';

import { useTranslation } from 'react-i18next';
import { queryClient, useApi } from '@services/api-service';
import { eligibilityQueryKeys, Group } from '@services/permissions-service';
import { NewPermissionListItem } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permission-list-item/new-permission-list-item.component';
import React from 'react';
import { useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { NewPermissionCardItem } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permission-card-item/new-permission-card-item.component';
import { PermissionRequestDto } from '@interfaces/eligibility';

interface NewPermissionsProps {
  permissions: Record<string, Group>;
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
  const { permissions } = props;
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

  const handlePermissionMutation = async ({
    payload,
    mutation,
    successMessage,
    errorMessage,
  }: PermissionMutationOptions<PermissionRequestDto>) => {
    try {
      await mutation.mutateAsync(payload);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [eligibilityQueryKeys.newPermissions],
        }),
        queryClient.invalidateQueries({
          queryKey: [eligibilityQueryKeys.currentAndClosedPermissions],
        }),
      ]);
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

  const handleApprovePermission = async (contractIds: number[], eligablePartyId: string, customerId: number) => {
    await handlePermissionMutation({
      payload: {
        PermissionRequest: {
          ContractIdList: contractIds,
          EligablePartyId: eligablePartyId,
          CustomerId: customerId,
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

  if (!permissions || Object.keys(permissions).length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="leading-h3-lg">{t('eligibility:permissions.new')}</h3>
      <p className="pt-8">{t('eligibility:permissions.description.new')}</p>
      {...Object.entries(permissions).map(([company, parts]: [string, Group]) => {
        const commonProps = {
          company,
          permissions: parts.parts,
          hasBeenProcessed: parts.hasBeenProcessed,
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
