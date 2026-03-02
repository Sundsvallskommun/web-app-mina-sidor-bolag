'use client';

import { useTranslation } from 'react-i18next';
import { Button, FormControl, Table } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { EligablePartyPart } from '@interfaces/eligibility';

interface NewPermissionListItemProps {
  company: string;
  permissions: EligablePartyPart[];
  handleApprovePermission: (contractIds: number[], eligablePartyId: string, customerId: number) => void;
  handleDenyPermission: (customerId: number, eligablePartyId: string) => void;
}

export const NewPermissionListItem = (props: NewPermissionListItemProps) => {
  const { company, permissions, handleApprovePermission, handleDenyPermission } = props;
  const { t } = useTranslation(['common', 'eligibility']);

  return (
    <div className="bg-background-content p-20 rounded-cards shadow-50 my-16 w-full" data-cy="new-permissions-card">
      <div className="p-16">
        <div className="flex justify-between">
          <div>
            <h4 className="leading-h4-md">{company}</h4>

            <p>{t('eligibility:permissions.item.received', { date: '' })}</p>
            <p>
              {t('eligibility:permissions.item.handleLatest', {
                date: dayjs(permissions[0]?.LastDayToApprove).format('YYYY-MM-DD'),
              })}
            </p>
          </div>
          <div className="flex gap-16">
            <Button
              size="md"
              color="error"
              inverted
              onClick={() => handleDenyPermission(permissions[0].CustomerId, permissions[0].EligablePartyId)}
            >
              {t('eligibility:permissions.item.deny')}
            </Button>
            <Button
              size="md"
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
        </div>
      </div>

      <FormControl className="w-full" fieldset>
        <Table data-cy="new-permissions-table">
          <Table.Header>
            <Table.HeaderColumn>{t('eligibility:permissions.item.address')}</Table.HeaderColumn>
            <Table.HeaderColumn>{t('eligibility:permissions.item.facilityId')}</Table.HeaderColumn>
            <Table.HeaderColumn>{t('eligibility:permissions.item.validTime')}</Table.HeaderColumn>
          </Table.Header>

          <Table.Body>
            {permissions.map((permission) => {
              return (
                <Table.Row key={permission.EligablePartyPermissionId}>
                  <Table.Column>{permission.UsePlaceAddress}</Table.Column>
                  <Table.Column>{permission.ServiceIdentifier}</Table.Column>
                  <Table.Column>
                    {t('eligibility:permissions.item.periodOfValidity', {
                      start: dayjs(permission.StartDay).format('YYYY-MM-DD'),
                      end: permission.EndDay
                        ? dayjs(permission.EndDay).format('YYYY-MM-DD')
                        : t('eligibility:permissions.item.continuous'),
                    })}
                  </Table.Column>
                  <Table.Column className="flex justify-end !gap-16 !pr-16">
                    <Button
                      data-cy="approveOne"
                      onClick={() =>
                        handleApprovePermission(
                          [permission.ContractId],
                          permission.EligablePartyId,
                          permission.CustomerId
                        )
                      }
                      size="sm"
                      color="gronsta"
                      inverted
                    >
                      {t('eligibility:permissions.item.approve')}
                    </Button>
                  </Table.Column>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </FormControl>
    </div>
  );
};
