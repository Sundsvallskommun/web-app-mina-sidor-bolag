import React from 'react';
import dayjs from 'dayjs';
import { cx, useThemeQueries } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { StructuredEvent } from '@interfaces/event';

export const EventItem: React.FC<{ data: StructuredEvent }> = ({ data }) => {
  const { isMinDesktop } = useThemeQueries();
  const { t } = useTranslation(['common', 'event']);

  return (
    data.metadata && (
      <div
        className="w-full bg-background-100 border-1 border-divider rounded-cards"
        data-cy={`event-item-${data.created}`}
      >
        <div className="px-20 pt-20">
          <strong>{data.exportName}</strong>
          <p>
            {t('event:logCreated', {
              date: dayjs(data.created).format('YYYY-MM-DD'),
              time: dayjs(data.created).format('HH:mm'),
            })}
          </p>
        </div>

        <div className="pb-20">
          {isMinDesktop && (
            <div className="flex items-start pt-24 self-stretch px-20">
              <strong className="max-w-[180px] flex-1">{t('event:address')}</strong>
              <strong className="max-w-[180px] flex-1">{t('event:facilityId')}</strong>
              <strong className="max-w-[140px] flex-1">{t('event:category')}</strong>
              <strong className="max-w-[240px] flex-1">{t('event:timePeriod')}</strong>
              <strong className="max-w-[140px] flex-1">{t('event:aggregateOn')}</strong>
            </div>
          )}

          <div>
            {data.metadata.facilities.map((facility, index) => {
              return isMinDesktop ? (
                <div key={`${facility.address}-${index}`} className="flex px-20">
                  <p className="max-w-[180px] flex-1">{facility.address ?? t('common:unknown')}</p>
                  <p className="max-w-[180px] flex-1">{facility.facilityId ?? t('common:unknown')}</p>
                  <p className="max-w-[140px] flex-1">{facility.category ?? t('common:unknown')}</p>
                  <p className="max-w-[240px] flex-1">
                    {facility.fromDate} - {facility.toDate}
                  </p>
                  <p className="max-w-[140px]">{facility.aggregateOn ?? t('common:unknown')}</p>
                </div>
              ) : (
                <div
                  key={`${facility.address}-${index}`}
                  className={cx(index !== data.metadata.facilities.length - 1 ? 'border-b-1 border-b-divider' : '')}
                >
                  <div className="px-20">
                    <strong>{t('event:address')}</strong>
                    <p>{facility.address ?? t('common:unknown')}</p>
                    <strong>{t('event:facilityId')}</strong>
                    <p>{facility.facilityId ?? t('common:unknown')}</p>
                    <strong>{t('event:category')}</strong>
                    <p>{facility.category ?? t('common:unknown')}</p>
                    <strong>{t('event:timePeriod')}</strong>
                    <p>
                      {facility.fromDate} - {facility.toDate}
                    </p>
                    <strong>{t('event:aggregateOn')}</strong>
                    <p>{facility.aggregateOn ?? t('common:unknown')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )
  );
};
