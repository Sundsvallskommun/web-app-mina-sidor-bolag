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

interface InformationCardProps {
  icon: React.JSX.Element;
  label: string;
  value: string;
  description?: string;
  descriptionClassName?: string;
  dataCy?: string;
}

function InformationCard(props: Readonly<InformationCardProps>) {
  const { icon, label, value, description, descriptionClassName = '', dataCy } = props;

  return (
    <div className="flex-1 p-16 rounded-8 bg-background-color-mixin-1">
      <div className="flex items-center gap-8 pb-12">
        <Icon icon={icon} size={22} />
        <p className="text-small text-secondary">{label}</p>
      </div>
      <h4 className="text-h4-sm" data-cy={dataCy}>
        {value}
      </h4>
      <p className={`text-small ${descriptionClassName}`}>{description}</p>
    </div>
  );
}

export default function ConsumptionInformation(props: Readonly<ConsumptionInformationProps>) {
  const { data } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation('statistics');

  if (data && isNormalYear(getValues().year)) {
    return (
      <div className="flex flex-col lg:flex-row gap-24 pt-56">
        <InformationCard
          icon={<BarChart />}
          label={t('statistics:consumption.total', { label: t('statistics:consumption.consumption') })}
          value={t('statistics:consumption.amount', { consumption: data.totalConsumption, unit: data.unit })}
          description={data.formattedDate}
          descriptionClassName="capitalize"
          dataCy="total-consumption-value"
        />

        <InformationCard
          icon={<BarChart />}
          label={t('statistics:consumption.correctedConsumption')}
          value={t('statistics:consumption.amount', {
            consumption: calculateTotalConsumption(data.correctedUsageData),
            unit: data.unit,
          })}
          description={data.formattedDate}
          descriptionClassName="capitalize"
          dataCy="corrected-consumption-value"
        />
      </div>
    );
  }

  const label =
    getValues().facilityType === FacilityTypeName.ELECTRICITY_PRODUCTION
      ? t('statistics:consumption.production')
      : t('statistics:consumption.consumption');

  return (
    data && (
      <div className="flex flex-col lg:flex-row gap-24 pt-56">
        <InformationCard
          icon={<BarChart />}
          label={t('statistics:consumption.total', { label })}
          value={t('statistics:consumption.amount', { consumption: data.totalConsumption, unit: data.unit })}
          description={data.formattedDate}
          descriptionClassName="capitalize"
          dataCy="total-consumption-value"
        />

        <InformationCard
          icon={<TrendingUp />}
          label={t('statistics:consumption.highest', { label })}
          value={t('statistics:consumption.amount', { consumption: data.peakConsumptionValue.value, unit: data.unit })}
          description={data.peakConsumptionValue.timestamp}
          dataCy="highest-consumption-value"
        />

        <InformationCard
          icon={<ChartNoAxesCombined />}
          label={t('statistics:consumption.average', { label })}
          value={t('statistics:consumption.amount', { consumption: data.averageConsumption, unit: data.unit })}
          description={`per ${translateAggregateOn(data.aggregatedOn, t)}`}
          dataCy="average-consumption-value"
        />

        {data.peakHourUsage?.length && data.peakEffectValue?.value ? (
          <InformationCard
            icon={<Zap />}
            label={t('statistics:consumption.peakEffect')}
            value={t('statistics:consumption.peakEffectAmount', {
              amount: data.peakEffectValue.value,
              unit: data.unit,
            })}
            description={data.peakEffectValue.timestamp}
          />
        ) : null}
      </div>
    )
  );
}
