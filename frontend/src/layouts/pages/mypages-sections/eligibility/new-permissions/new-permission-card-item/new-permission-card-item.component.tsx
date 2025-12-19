'use client';

import { useTranslation } from 'react-i18next';
import { Button, Divider } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { EligablePartyPart } from '@interfaces/eligibility';

interface NewPermissionCardItemProps {
  company: string;
  permissions: EligablePartyPart[];
  handleApprovePermission: (contractIds: number[], eligablePartyId: string) => void;
  handleDenyPermission: (customerId: number, eligablePartyId: string) => void;
}

export const NewPermissionCardItem = (props: NewPermissionCardItemProps) => {
  const { company, permissions, handleApprovePermission, handleDenyPermission } = props;
  const { t } = useTranslation(['common', 'eligibility']);

  return (
    <div className="bg-background-content rounded-cards shadow-50 my-24">
      <div className="p-20">
        <h4 className="leading-h4-md">{company}</h4>
        <p>{t('eligibility:item.received', { date: '' })} </p>
        <p>
          {t('eligibility:item.handleLatest', {
            date: dayjs(permissions[0]?.LastDayToApprove).format('YYYY-MM-DD'),
          })}
        </p>
      </div>

      {permissions.map((permission) => {
        return (
          <div key={permission.EligablePartyPermissionId}>
            <Divider />
            <div key={permission.ServiceIdentifier} className="flex flex-col px-20 py-24 gap-y-8">
              <div>
                <strong>{t('eligibility:item.address')}</strong>
                <p>{permission.UsePlaceAddress}</p>
              </div>
              <div>
                <strong>{t('eligibility:item.facilityId')}</strong>
                <p>{permission.ServiceIdentifier}</p>
              </div>
              <div>
                <strong>{t('eligibility:item.validTime')}</strong>
                <p>
                  {dayjs(permission.StartDay).format('YYYY-MM-DD')} -
                  {permission.EndDay ? dayjs(permission.EndDay).format('YYYY-MM-DD') : ' Löpande'}
                </p>
              </div>

              <div className="flex gap-24 mt-16">
                <Button
                  size="lg"
                  color="error"
                  inverted
                  className="flex-1"
                  onClick={() => handleDenyPermission(permission.CustomerId, permission.EligablePartyId)}
                >
                  {t('eligibility:item.deny')}
                </Button>
                <Button
                  size="lg"
                  color="gronsta"
                  inverted
                  className="flex-1"
                  onClick={() => handleApprovePermission([permission.ContractId], permission.EligablePartyId)}
                >
                  {t('eligibility:item.approve')}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
