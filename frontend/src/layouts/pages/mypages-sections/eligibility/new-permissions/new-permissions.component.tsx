'use client';

import { useTranslation } from 'react-i18next';
import { queryClient, useApi } from '@services/api-service';
import { pendingEligibilityHandler } from '@services/new-permissions-service';
import { NewPermissionListItem } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permission-list-item/new-permission-list-item.component';
import React from 'react';
import { useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { NewPermissionCardItem } from '@layouts/pages/mypages-sections/eligibility/new-permissions/new-permission-card-item/new-permission-card-item.component';
import { EligablePartyPart } from '@interfaces/eligibility';

interface NewPermissionsProps {
  customerIds: number[];
}

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

  const handleApprovePermission = async (contractIds: number[], eligablePartyId: string) => {
    const formData = {
      PermissionRequest: {
        ContractIdList: contractIds,
        EligablePartyId: eligablePartyId,
      },
    };

    await grantPermission
      .mutateAsync(formData)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ['new-permissions'],
        });
        snackBar({
          message: 'Medgivande godkändes',
          status: 'success',
        });
      })
      .catch(() => {
        snackBar({
          message: 'Något gick fel när medgivande skulle godkännas',
          status: 'error',
        });
      });
  };

  const handleDenyPermission = async (customerId: number, eligablePartyId: string) => {
    const formData = {
      PermissionRequest: {
        CustomerId: customerId,
        EligablePartyId: eligablePartyId,
      },
    };
    await denyPermission
      .mutateAsync(formData)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ['new-permissions'],
        });
        snackBar({
          message: 'Medgivande nekades',
          status: 'success',
        });
      })
      .catch(() => {
        snackBar({
          message: 'Något gick fel när medgivande skulle nekas',
          status: 'error',
        });
      });
  };

  return (
    newPermissions &&
    Object.keys(newPermissions) && (
      <div>
        <h3 className="leading-h3-lg">{t('eligibility:item.new')}</h3>
        <p className="pt-8">{t('eligibility:item.newDescription')}</p>

        {newPermissions &&
          Object.entries(newPermissions).map(([company, permissions]: [string, EligablePartyPart[]]) => {
            return isMinLg ? (
              <NewPermissionListItem
                key={company}
                eligablePartyId={permissions[0].EligablePartyId}
                customerId={permissions[0].CustomerId}
                company={company}
                permissions={permissions}
                handleApprovePermission={handleApprovePermission}
                handleDenyPermission={handleDenyPermission}
              />
            ) : (
              <NewPermissionCardItem
                key={company}
                company={company}
                permissions={permissions}
                handleApprovePermission={handleApprovePermission}
                handleDenyPermission={handleDenyPermission}
              />
            );
          })}
      </div>
    )
  );
};
