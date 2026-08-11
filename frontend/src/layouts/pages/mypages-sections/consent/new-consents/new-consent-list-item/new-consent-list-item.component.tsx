'use client';

import { useTranslation } from 'react-i18next';
import { Button, FormControl, Table } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { Consent } from '@interfaces/consent';
import Alert from '@sk-web-gui/alert';

interface NewConsentListItemProps {
  company: string;
  consents: Consent[];
  hasBeenProcessed: boolean;
  handleApproveConsent: (contractIds: number[], eligablePartyId: string, customerId: number) => void;
  handleDenyConsent: (customerId: number, eligablePartyId: string) => void;
}

export const NewConsentListItem = (props: NewConsentListItemProps) => {
  const { company, consents, hasBeenProcessed, handleApproveConsent, handleDenyConsent } = props;
  const { t } = useTranslation(['common', 'consent']);

  return (
    <div
      className="bg-background-content p-20 rounded-cards shadow-50 my-16 w-full"
      data-cy={`new-consents-card-${company}`}
    >
      <div className="p-16">
        <div className="flex justify-between gap-80">
          <div>
            <h4 className="leading-h4-md">{company}</h4>

            <p>
              {t('consent:consents.item.received', {
                date: dayjs(consents[0]?.LastDayToApprove).subtract(21, 'days').format('YYYY-MM-DD'),
              })}
            </p>
            <p>
              {t('consent:consents.item.handleLatest', {
                date: dayjs(consents[0]?.LastDayToApprove).format('YYYY-MM-DD'),
              })}
            </p>
          </div>
          <div className="flex flex-col flex-1 items-end gap-16">
            <div className="flex gap-16">
              <Button
                size="md"
                color="error"
                inverted
                onClick={() => handleDenyConsent(consents[0].CustomerId, consents[0].EligablePartyId)}
                disabled={hasBeenProcessed}
                data-cy="denyRequest"
              >
                {t('consent:consents.item.deny')}
              </Button>
              <Button
                size="md"
                color="gronsta"
                inverted
                onClick={() =>
                  handleApproveConsent(
                    consents.map((p) => p.ContractId),
                    consents[0].EligablePartyId,
                    consents[0].CustomerId
                  )
                }
              >
                {t('consent:consents.item.approveAll')}
              </Button>
            </div>
            <div>
              <Alert size="sm" type="neutral" className="w-[480px]">
                <Alert.Icon />
                <Alert.Content>
                  <Alert.Content.Description>{t('consent:consents.item.processInfo')}</Alert.Content.Description>
                </Alert.Content>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      <FormControl className="w-full" fieldset>
        <Table data-cy="new-consents-table">
          <Table.Header>
            <Table.HeaderColumn>{t('consent:consents.item.address')}</Table.HeaderColumn>
            <Table.HeaderColumn>{t('consent:consents.item.facilityId')}</Table.HeaderColumn>
            <Table.HeaderColumn>{t('consent:consents.item.validTime')}</Table.HeaderColumn>
          </Table.Header>

          <Table.Body>
            {consents.map((consent) => {
              return (
                <Table.Row key={consent.EligablePartyPermissionId}>
                  <Table.Column>{consent.UsePlaceAddress}</Table.Column>
                  <Table.Column>{consent.ServiceIdentifier}</Table.Column>
                  <Table.Column>
                    {t('consent:consents.item.periodOfValidity', {
                      start: dayjs(consent.StartDay).format('YYYY-MM-DD'),
                      end: consent.EndDay
                        ? dayjs(consent.EndDay).format('YYYY-MM-DD')
                        : t('consent:consents.item.continuous'),
                    })}
                  </Table.Column>
                  <Table.Column className="flex justify-end !gap-16 !pr-16">
                    <Button
                      data-cy="approveOne"
                      onClick={() =>
                        handleApproveConsent([consent.ContractId], consent.EligablePartyId, consent.CustomerId)
                      }
                      size="sm"
                      color="gronsta"
                      inverted
                    >
                      {t('consent:consents.item.approve')}
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
