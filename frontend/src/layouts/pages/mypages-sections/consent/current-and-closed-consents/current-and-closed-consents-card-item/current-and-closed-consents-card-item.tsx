'use client';

import { Divider } from '@sk-web-gui/react';
import { CurrentAndClosedConsentsProps } from '../current-and-closed-consents-table/current-and-closed-consents-table';
import { useTranslation } from 'react-i18next';

export const CurrentAndClosedConsentsCard = ({
  ongoing,
  activePanel,
  headerLabel,
  formatDate,
  filterConsents,
  revokeActionButton,
  handleEndDate,
}: CurrentAndClosedConsentsProps) => {
  const currentAndClosedConsents = filterConsents(ongoing);
  const { t } = useTranslation('consent');

  return (
    <div
      className="bg-background-content rounded-cards shadow-50 my-24"
      data-cy="current-and-closed-consents-card-container"
    >
      {currentAndClosedConsents.map((consent) => {
        return (
          <div key={consent.EligablePartyPermissionId}>
            <div key={consent.ServiceIdentifier} className="flex flex-col px-20 py-24 gap-16">
              <div>
                <strong>{headerLabel('company')}</strong>
                <p>{consent.EnergyServiceParty}</p>
              </div>
              <div>
                <strong>{headerLabel('address')}</strong>
                <p>{consent.UsePlaceAddress}</p>
              </div>
              <div>
                <strong>{headerLabel('service-identifier')}</strong>
                <p>{consent.ServiceIdentifier}</p>
              </div>
              <div>
                <strong>{headerLabel('validity-period')}</strong>
                <p>
                  {`${formatDate(consent.StartDay)} -
                  ${consent.EndDay ? formatDate(consent.EndDay) : t('consent:consents.item.continuous')}`}
                </p>
              </div>
              <div>
                <strong>{headerLabel(activePanel === 0 ? 'approved' : 'closed')}</strong>
                <p>{formatDate(handleEndDate(consent))}</p>
              </div>
              <div className={`flex ${ongoing ? 'justify-center' : 'justify-start'}`}>
                {revokeActionButton(consent)}
              </div>
            </div>
            {currentAndClosedConsents.at(-1) !== consent && <Divider />}
          </div>
        );
      })}
    </div>
  );
};
