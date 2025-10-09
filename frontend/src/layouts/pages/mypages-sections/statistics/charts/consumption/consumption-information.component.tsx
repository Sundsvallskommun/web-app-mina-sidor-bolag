import React from 'react';
import { Icon } from '@sk-web-gui/react';
import { BarChart, ChartNoAxesCombined, TrendingUp, Zap } from 'lucide-react';
import { StatisticsMeasurementData } from '@interfaces/measurement-data';
import { translateAggregateOn } from '@services/measurement-data-service';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface ConsumptionInformationProps {
  data: StatisticsMeasurementData | undefined;
}

export default function ConsumptionInformation(props: ConsumptionInformationProps) {
  const { data } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation('statistics');

  return (
    data && (
      <div className="lg:flex lg:justify-between block pt-56">
        <div className="border-divider lg:pr-48 lg:border-b-0 border-b-1 lg:py-0 py-16">
          <div className="flex items-center pb-12">
            <Icon icon={<BarChart />} size={22} />
            <p className="text-secondary pl-8">
              {t('statistics:consumption.total', {
                label:
                  getValues().category === t('statistics:consumption.electricityProduction')
                    ? t('statistics:consumption.production')
                    : t('statistics:consumption.consumption'),
              })}
            </p>
          </div>
          <h4 data-cy="total-consumption-value">
            {t('statistics:consumption.amount', { consumption: data.totalConsumption })}
          </h4>
          <p className="capitalize">{data.formattedDate}</p>
        </div>

        <div className="flex lg:pr-48 pr-0 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
          <div className="lg:pl-48 pl-0">
            <div className="flex items-center pb-12">
              <Icon icon={<TrendingUp />} size={22} />
              <p className="text-secondary pl-8">
                {t('statistics:consumption.highest', {
                  label:
                    getValues().category === t('statistics:consumption.electricityProduction')
                      ? t('statistics:consumption.production')
                      : t('statistics:consumption.consumption'),
                })}
              </p>
            </div>
            <h4 data-cy="highest-consumption-value">
              {t('statistics:consumption.amount', { consumption: data.peakConsumptionValue.value })}
            </h4>
            <p>{data.peakConsumptionValue.timestamp}</p>
          </div>
        </div>

        <div className="flex lg:pr-48 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
          <div className="lg:pl-48 pl-0">
            <div className="flex items-center pb-12">
              <Icon icon={<ChartNoAxesCombined />} size={22} />
              <p className="text-secondary pl-8">
                {t('statistics:consumption.average', {
                  label:
                    getValues().category === t('statistics:consumption.electricityProduction')
                      ? t('statistics:consumption.production')
                      : t('statistics:consumption.consumption'),
                })}
              </p>
            </div>
            <h4 data-cy="average-consumption-value">
              {t('statistics:consumption.amount', { consumption: data.averageConsumption })}
            </h4>
            <p>per {translateAggregateOn(data.aggregatedOn)}</p>
          </div>
        </div>

        {data.peakHourUsage?.length && data.peakEffectValue?.value ? (
          <div className="flex lg:pr-32 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
            <div className="lg:pl-48 pl-0">
              <div className="flex items-center pb-12">
                <Icon icon={<Zap />} size={22} />
                <p className="text-secondary pl-8">{t('statistics:consumption.peakEffect')}</p>
              </div>
              <h4>{t('statistics:consumption.peakEffectAmount', { amount: data.peakEffectValue.value })}</h4>
              <p>{data.peakEffectValue.timestamp}</p>
            </div>
          </div>
        ) : null}
      </div>
    )
  );
}
