'use client';

import { useTranslation } from 'react-i18next';
import { Button, Divider } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { Consent } from '@interfaces/consent';
import Alert from '@sk-web-gui/alert';

interface NewConsentCardItemProps {
  company: string;
  consents: Consent[];
  hasBeenProcessed: boolean;
  handleApproveConsent: (contractIds: number[], eligablePartyId: string, customerId: number) => void;
  handleDenyConsent: (customerId: number, eligablePartyId: string) => void;
}

export const NewConsentCardItem = (props: NewConsentCardItemProps) => {
  const { company, consents, hasBeenProcessed, handleApproveConsent, handleDenyConsent } = props;
  const { t } = useTranslation(['common', 'consent']);

  return (
    <div className="bg-background-content rounded-cards shadow-50 my-24">
      <div className="p-20">
        <h4 className="leading-h4-md">{company}</h4>
        <p>
          {t('consent:consents.item.received', {
            date: dayjs(consents[0]?.LastDayToApprove).subtract(21, 'days').format('YYYY-MM-DD'),
          })}{' '}
        </p>
        <p>
          {t('consent:consents.item.handleLatest', {
            date: dayjs(consents[0]?.LastDayToApprove).format('YYYY-MM-DD'),
          })}
        </p>
        <div className="flex flex-col gap-24 my-24">
          <Button
            size="lg"
            color="error"
            inverted
            onClick={() => handleDenyConsent(consents[0].CustomerId, consents[0].EligablePartyId)}
            disabled={hasBeenProcessed}
          >
            {t('consent:consents.item.deny')}
          </Button>
          <Button
            size="lg"
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
          <Alert size="sm" type="neutral">
            <Alert.Icon />
            <Alert.Content>
              <Alert.Content.Description>{t('consent:consents.item.processInfo')}</Alert.Content.Description>
            </Alert.Content>
          </Alert>
        </div>
      </div>

      {consents.map((consent) => {
        return (
          <div key={consent.EligablePartyPermissionId}>
            <Divider />
            <div key={consent.ServiceIdentifier} className="flex flex-col px-20 py-24 gap-y-8">
              <div>
                <strong>{t('consent:consents.item.address')}</strong>
                <p>{consent.UsePlaceAddress}</p>
              </div>
              <div>
                <strong>{t('consent:consents.item.facilityId')}</strong>
                <p>{consent.ServiceIdentifier}</p>
              </div>
              <div>
                <strong>{t('consent:consents.item.validTime')}</strong>
                <p>
                  {t('consent:consents.item.periodOfValidity', {
                    start: dayjs(consent.StartDay).format('YYYY-MM-DD'),
                    end: consent.EndDay
                      ? dayjs(consent.EndDay).format('YYYY-MM-DD')
                      : t('consent:consents.item.continuous'),
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
                    handleApproveConsent([consent.ContractId], consent.EligablePartyId, consent.CustomerId)
                  }
                >
                  {t('consent:consents.item.approve')}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
