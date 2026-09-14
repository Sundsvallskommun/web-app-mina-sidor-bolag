import React from 'react';
import { Icon } from '@sk-web-gui/react';
import { BarChart, ChartNoAxesCombined, TrendingUp, Zap } from 'lucide-react';
import { StatisticsMeasurementData } from '@interfaces/measurement-data';
import { calculateTotalConsumption, translateAggregateOn } from '@services/measurement-data-service';
import { FacilityTypeName } from '@utils/facility';
import { isNormalYear } from '@utils/normal-year';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface ConsumptionInformationProps {
  data: StatisticsMeasurementData | undefined;
}

export default function ConsumptionInformation(props: Readonly<ConsumptionInformationProps>) {
  const { data } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation('statistics');

  if (data && isNormalYear(getValues().year)) {
    return (
      <div className="lg:flex block pt-56">
        <div className="flex-1 border-divider lg:pr-40 lg:border-b-0 border-b-1 lg:py-0 py-16">
          <div className="flex items-center pb-12">
            <Icon icon={<BarChart />} size={22} />
            <p className="text-secondary pl-8">
              {t('statistics:consumption.total', { label: t('statistics:consumption.consumption') })}
            </p>
          </div>
          <h4 data-cy="total-consumption-value">
            {t('statistics:consumption.amount', { consumption: data.totalConsumption, unit: data.unit })}
          </h4>
          <p className="capitalize">{data.formattedDate}</p>
        </div>

        <div className="flex-1 border-divider lg:border-l-1 lg:border-b-0 border-l-0 lg:pl-40 lg:py-0 py-16">
          <div className="flex items-center pb-12">
            <Icon icon={<BarChart />} size={22} />
            <p className="text-secondary pl-8">{t('statistics:consumption.correctedConsumption')}</p>
          </div>
          <h4 data-cy="corrected-consumption-value">
            {t('statistics:consumption.amount', {
              consumption: calculateTotalConsumption(data.correctedUsageData),
              unit: data.unit,
            })}
          </h4>
          <p className="capitalize">{data.formattedDate}</p>
        </div>
      </div>
    );
  }

  return (
    data && (
      <div className="lg:flex lg:justify-between block pt-56">
        <div className="border-divider lg:pr-48 lg:border-b-0 border-b-1 lg:py-0 py-16">
          <div className="flex items-center pb-12">
            <Icon icon={<BarChart />} size={22} />
            <p className="text-secondary pl-8">
              {t('statistics:consumption.total', {
                label:
                  getValues().facilityType === FacilityTypeName.ELECTRICITY_PRODUCTION
                    ? t('statistics:consumption.production')
                    : t('statistics:consumption.consumption'),
              })}
            </p>
          </div>
          <h4 data-cy="total-consumption-value">
            {t('statistics:consumption.amount', { consumption: data.totalConsumption, unit: data.unit })}
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
                    getValues().facilityType === FacilityTypeName.ELECTRICITY_PRODUCTION
                      ? t('statistics:consumption.production')
                      : t('statistics:consumption.consumption'),
                })}
              </p>
            </div>
            <h4 data-cy="highest-consumption-value">
              {t('statistics:consumption.amount', { consumption: data.peakConsumptionValue.value, unit: data.unit })}
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
                    getValues().facilityType === FacilityTypeName.ELECTRICITY_PRODUCTION
                      ? t('statistics:consumption.production')
                      : t('statistics:consumption.consumption'),
                })}
              </p>
            </div>
            <h4 data-cy="average-consumption-value">
              {t('statistics:consumption.amount', { consumption: data.averageConsumption, unit: data.unit })}
            </h4>
            <p>per {translateAggregateOn(data.aggregatedOn, t)}</p>
          </div>
        </div>

        {data.peakHourUsage?.length && data.peakEffectValue?.value ? (
          <div className="flex lg:pr-32 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
            <div className="lg:pl-48 pl-0">
              <div className="flex items-center pb-12">
                <Icon icon={<Zap />} size={22} />
                <p className="text-secondary pl-8">{t('statistics:consumption.peakEffect')}</p>
              </div>
              <h4>
                {t('statistics:consumption.peakEffectAmount', { amount: data.peakEffectValue.value, unit: data.unit })}
              </h4>
              <p>{data.peakEffectValue.timestamp}</p>
            </div>
          </div>
        ) : null}
      </div>
    )
  );
}
