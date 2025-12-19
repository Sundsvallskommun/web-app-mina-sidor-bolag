'use client';

import { useTranslation } from 'react-i18next';
import { Button, Checkbox, FormControl, Table } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { EligablePartyPart } from '@interfaces/eligibility';

interface NewPermissionListItemProps {
  company: string;
  permissions: EligablePartyPart[];
  eligablePartyId: string;
  customerId: number;
  handleApprovePermission: (contractIds: number[], eligablePartyId: string) => void;
  handleDenyPermission: (customerId: number, eligablePartyId: string) => void;
}

export const NewPermissionListItem = (props: NewPermissionListItemProps) => {
  const { company, permissions, eligablePartyId, handleApprovePermission, handleDenyPermission } = props;
  const { t } = useTranslation(['common', 'eligibility']);

  const { register, watch, setValue } = useForm<{
    selectedContractIds: number[];
  }>({
    defaultValues: { selectedContractIds: [] },
  });

  const selected = watch('selectedContractIds');

  const handleChangeAll = () => {
    if (permissions.every((permission: EligablePartyPart) => selected.includes(permission.ContractId))) {
      setValue('selectedContractIds', []);
    } else {
      setValue(
        'selectedContractIds',
        permissions.map((permission) => permission.ContractId)
      );
    }
  };

  const isIndeterminate =
    selected.length > 0 && !permissions.every((permission) => selected.includes(permission.ContractId));

  return (
    <div className="bg-background-content p-20 rounded-cards shadow-50 my-16 w-full">
      <div className="p-16">
        <h4 className="leading-h4-md">{company}</h4>
        <p>
          {t('eligibility:item.received', {
            date: dayjs(permissions[0]?.LastDayToApprove).subtract(21, 'days').format('YYYY-MM-DD'),
          })}
        </p>
        <p>
          {t('eligibility:item.handleLatest', {
            date: dayjs(permissions[0]?.LastDayToApprove).format('YYYY-MM-DD'),
          })}
        </p>
      </div>

      <FormControl className="w-full" fieldset>
        <Table>
          <Table.Header>
            <Table.HeaderColumn>
              <Checkbox checked={selected.length > 0} onChange={handleChangeAll} indeterminate={isIndeterminate} />
            </Table.HeaderColumn>
            <Table.HeaderColumn>{t('eligibility:item.address')}</Table.HeaderColumn>
            <Table.HeaderColumn>{t('eligibility:item.facilityId')}</Table.HeaderColumn>
            <Table.HeaderColumn>{t('eligibility:item.validTime')}</Table.HeaderColumn>
            <Table.HeaderColumn className="flex justify-end gap-16">
              {selected?.length > 1 ? <p>{selected.length} valda</p> : null}
              <Button
                size="sm"
                color="error"
                inverted
                disabled={selected?.length < 2}
                onClick={() => handleDenyPermission(permissions[0].CustomerId, eligablePartyId)}
              >
                {t('eligibility:item.deny')}
              </Button>
              <Button
                size="sm"
                color="gronsta"
                inverted
                disabled={selected?.length < 2}
                onClick={() => handleApprovePermission(selected, eligablePartyId)}
              >
                {t('eligibility:item.approve')}
              </Button>
            </Table.HeaderColumn>
          </Table.Header>

          <Table.Body>
            {permissions.map((permission, index) => {
              return (
                <Table.Row key={index}>
                  <Table.Column>
                    <Checkbox
                      {...register('selectedContractIds')}
                      key={permission.ContractId}
                      value={permission.ContractId}
                    />
                  </Table.Column>
                  <Table.Column>{permission.UsePlaceAddress}</Table.Column>
                  <Table.Column>{permission.ServiceIdentifier}</Table.Column>
                  <Table.Column>
                    {dayjs(permission.StartDay).format('YYYY-MM-DD')} -
                    {permission.EndDay ? dayjs(permission.EndDay).format('YYYY-MM-DD') : ' Löpande'}
                  </Table.Column>
                  <Table.Column className="flex justify-end !gap-16 !pr-16">
                    <Button
                      onClick={() => handleDenyPermission(permission.CustomerId, permission.EligablePartyId)}
                      size="sm"
                      color="error"
                      inverted
                      disabled={selected?.length > 1}
                    >
                      {t('eligibility:item.deny')}
                    </Button>
                    <Button
                      onClick={() => handleApprovePermission([permission.ContractId], permission.EligablePartyId)}
                      size="sm"
                      color="gronsta"
                      inverted
                      disabled={selected?.length > 1}
                    >
                      {t('eligibility:item.approve')}
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
