'use client';

import { useTranslation } from 'react-i18next';
import { Button, Divider } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { EligablePartyPart } from '@interfaces/eligibility';
import Alert from '@sk-web-gui/alert';

interface NewPermissionCardItemProps {
  company: string;
  permissions: EligablePartyPart[];
  hasBeenProcessed: boolean;
  handleApprovePermission: (contractIds: number[], eligablePartyId: string, customerId: number) => void;
  handleDenyPermission: (customerId: number, eligablePartyId: string) => void;
}

export const NewPermissionCardItem = (props: NewPermissionCardItemProps) => {
  const { company, permissions, hasBeenProcessed, handleApprovePermission, handleDenyPermission } = props;
  const { t } = useTranslation(['common', 'eligibility']);

  return (
    <div className="bg-background-content rounded-cards shadow-50 my-24">
      <div className="p-20">
        <h4 className="leading-h4-md">{company}</h4>
        <p>
          {t('eligibility:permissions.item.received', {
            date: dayjs(permissions[0]?.LastDayToApprove).subtract(21, 'days').format('YYYY-MM-DD'),
          })}{' '}
        </p>
        <p>
          {t('eligibility:permissions.item.handleLatest', {
            date: dayjs(permissions[0]?.LastDayToApprove).format('YYYY-MM-DD'),
          })}
        </p>
        <div className="flex flex-col gap-24 my-24">
          <Button
            size="lg"
            color="error"
            inverted
            onClick={() => handleDenyPermission(permissions[0].CustomerId, permissions[0].EligablePartyId)}
            disabled={hasBeenProcessed}
          >
            {t('eligibility:permissions.item.deny')}
          </Button>
          <Button
            size="lg"
            color="gronsta"
            inverted
            onClick={() =>
              handleApprovePermission(
                permissions.map((p) => p.ContractId),
                permissions[0].EligablePartyId,
                permissions[0].CustomerId
              )
            }
          >
            {t('eligibility:permissions.item.approveAll')}
          </Button>
        </div>
        <div>
          <Alert size="sm" type="neutral">
            <Alert.Icon />
            <Alert.Content>
              <Alert.Content.Description>{t('eligibility:permissions.item.processInfo')}</Alert.Content.Description>
            </Alert.Content>
          </Alert>
        </div>
      </div>

      {permissions.map((permission) => {
        return (
          <div key={permission.EligablePartyPermissionId}>
            <Divider />
            <div key={permission.ServiceIdentifier} className="flex flex-col px-20 py-24 gap-y-8">
              <div>
                <strong>{t('eligibility:permissions.item.address')}</strong>
                <p>{permission.UsePlaceAddress}</p>
              </div>
              <div>
                <strong>{t('eligibility:permissions.item.facilityId')}</strong>
                <p>{permission.ServiceIdentifier}</p>
              </div>
              <div>
                <strong>{t('eligibility:permissions.item.validTime')}</strong>
                <p>
                  {t('eligibility:permissions.item.periodOfValidity', {
                    start: dayjs(permission.StartDay).format('YYYY-MM-DD'),
                    end: permission.EndDay
                      ? dayjs(permission.EndDay).format('YYYY-MM-DD')
                      : t('eligibility:permissions.item.continuous'),
                  })}
                </p>
              </div>

              <div className="flex gap-24 mt-16">
                <Button
                  size="lg"
                  color="gronsta"
                  inverted
                  className="flex-1"
                  onClick={() =>
                    handleApprovePermission([permission.ContractId], permission.EligablePartyId, permission.CustomerId)
                  }
                >
                  {t('eligibility:permissions.item.approve')}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
