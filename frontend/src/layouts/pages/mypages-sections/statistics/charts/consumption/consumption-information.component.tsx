import React from 'react';
import { Icon } from '@sk-web-gui/react';
import { BarChart, ChartNoAxesCombined, TrendingUp, Zap } from 'lucide-react';
import { StatisticsMeasurementData } from '@interfaces/measurement-data';
import { translateAggregateOn } from '@services/measurement-data-service';
import { useFormContext } from 'react-hook-form';

export interface ConsumptionInformationProps {
  data: StatisticsMeasurementData | undefined;
}

export default function ConsumptionInformation(props: ConsumptionInformationProps) {
  const { data } = props;
  const { getValues } = useFormContext();

  return (
    data && (
      <div className="lg:flex lg:justify-between block pt-56">
        <div className="border-divider lg:pr-48 lg:border-b-0 border-b-1 lg:py-0 py-16">
          <div className="flex items-center pb-12">
            <Icon icon={<BarChart />} size={22} />
            <p className="text-secondary pl-8">
              Total {getValues().category === 'Elproduktion' ? 'produktion' : 'förbrukning'}
            </p>
          </div>
          <h4 data-cy="total-consumption-value">{data.totalConsumption} kWh</h4>
          <p className="capitalize">{data.formattedDate}</p>
        </div>

        <div className="flex lg:pr-48 pr-0 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
          <div className="lg:pl-48 pl-0">
            <div className="flex items-center pb-12">
              <Icon icon={<TrendingUp />} size={22} />
              <p className="text-secondary pl-8">
                Högsta {getValues().category === 'Elproduktion' ? 'produktion' : 'förbrukning'}
              </p>
            </div>
            <h4 data-cy="highest-consumption-value">{data.peakConsumptionValue.value} kWh</h4>
            <p>{data.peakConsumptionValue.timestamp}</p>
          </div>
        </div>

        <div className="flex lg:pr-48 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
          <div className="lg:pl-48 pl-0">
            <div className="flex items-center pb-12">
              <Icon icon={<ChartNoAxesCombined />} size={22} />
              <p className="text-secondary pl-8">
                Genomsnittlig {getValues().category === 'Elproduktion' ? 'produktion' : 'förbrukning'}
              </p>
            </div>
            <h4 data-cy="average-consumption-value">{data.averageConsumption} kWh</h4>
            <p>per {translateAggregateOn(data.aggregatedOn)}</p>
          </div>
        </div>

        {data.peakHourUsage?.length ? (
          <div className="flex lg:pr-32 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
            <div className="lg:pl-48 pl-0">
              <div className="flex items-center pb-12">
                <Icon icon={<Zap />} size={22} />
                <p className="text-secondary pl-8">Högsta effekt</p>
              </div>
              <h4>{data.peakEffectValue.value} W</h4>
              <p>{data.peakEffectValue.timestamp}</p>
            </div>
          </div>
        ) : null}
      </div>
    )
  );
}
