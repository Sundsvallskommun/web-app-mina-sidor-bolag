'use client';

import { Divider } from '@sk-web-gui/react';
import { CurrentAndClosedEligibilityPermissionsProps } from '../current-and-closed-permissions-table/current-and-closed-eligibility-permissions-table';
import { useTranslation } from 'react-i18next';

export const CurrentAndClosedPermissionCard = ({
  ongoing,
  activePanel,
  headerLabel,
  formatDate,
  filterPermissions,
  revokeActionButton,
  handleEndDate,
}: CurrentAndClosedEligibilityPermissionsProps) => {
  const permissions = filterPermissions(ongoing);
  const { t } = useTranslation('eligibility');

  return (
    <div
      className="bg-background-content rounded-cards shadow-50 my-24"
      data-cy="current-and-closed-permissions-card-container"
    >
      {permissions.map((permission) => {
        return (
          <div key={permission.EligablePartyPermissionId}>
            <div key={permission.ServiceIdentifier} className="flex flex-col px-20 py-24 gap-16">
              <div>
                <strong>{headerLabel('company')}</strong>
                <p>{permission.EnergyServiceParty}</p>
              </div>
              <div>
                <strong>{headerLabel('address')}</strong>
                <p>{permission.UsePlaceAddress}</p>
              </div>
              <div>
                <strong>{headerLabel('service-identifier')}</strong>
                <p>{permission.ServiceIdentifier}</p>
              </div>
              <div>
                <strong>{headerLabel('validity-period')}</strong>
                <p>
                  {`${formatDate(permission.StartDay)} -
                  ${permission.EndDay ? formatDate(permission.EndDay) : t('eligibility:permissions.item.continuous')}`}
                </p>
              </div>
              <div>
                <strong>{headerLabel(activePanel === 0 ? 'approved' : 'closed')}</strong>
                <p>{formatDate(handleEndDate(permission))}</p>
              </div>
              <div className={`flex ${ongoing ? 'justify-center' : 'justify-start'}`}>
                {revokeActionButton(permission)}
              </div>
            </div>
            {permissions[permissions.length - 1] !== permission && <Divider />}
          </div>
        );
      })}
    </div>
  );
};
