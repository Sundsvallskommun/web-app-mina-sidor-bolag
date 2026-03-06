import React, { useMemo } from 'react';
import { Table } from '@sk-web-gui/react';
import {
  Aggregation,
  MeasurementPoints,
  MergedMeasurementPoints,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
} from '@interfaces/measurement-data';
import { translateAggregateOn } from '@services/measurement-data-service';
import { useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import { toFixedNumber } from '@react-stately/utils';
import { useTranslation } from 'react-i18next';

enum MeasurementType {
  CONSUMPTION = 'consumption',
  TEMPERATURE = 'temperature',
}

export interface MeasurementDataTableProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  isConsumption: boolean;
}

export const MeasurementDataTable = (props: MeasurementDataTableProps) => {
  const { data, isConsumption } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation('statistics');

  const formatDate = (timestamp: string) => {
    switch (data?.aggregatedOn) {
      case Aggregation.QUARTER:
      case Aggregation.HOUR:
        return dayjs(timestamp).format('HH:mm');
      case Aggregation.DAY:
        return dayjs(timestamp).format('D MMMM').toLowerCase();
      case Aggregation.MONTH:
        return dayjs(timestamp).format('MMMM');
      default:
        return t('statistics:missingDate');
    }
  };

  const measurementPoints = useMemo(() => {
    const points: MeasurementPoints[] | undefined = isConsumption
      ? data?.measurementData?.[0]?.measurementPoints
      : data?.temperatureData?.[0]?.measurementPoints;

    if (data?.aggregatedOn === Aggregation.QUARTER && points?.[0]?.values?.length) {
      const quarterPoints: MeasurementPoints[] | MergedMeasurementPoints[] = points.flatMap((point) => {
        if (point.values) {
          return point.values.map(
            (value, index) =>
              ({
                value,
                timestamp: dayjs(point.timestamp)
                  .add(index * 15, 'minute')
                  .toISOString(),
                previousValue: (point as MergedMeasurementPoints).previousValues
                  ? (point as MergedMeasurementPoints).previousValues?.[index]
                  : undefined,
              }) as MeasurementPoints | MergedMeasurementPoints
          );
        }
        return [];
      });

      return quarterPoints;
    }

    return points;
  }, [data, isConsumption]);

  const translateConsumptionAmount = (value?: number) => {
    return t('statistics:consumption.amount', {
      consumption: toFixedNumber(value ?? 0, 2),
    });
  };
  const translateTemperatureAmount = (value?: number) => {
    return t('statistics:consumption.temperature', {
      temperature: toFixedNumber(value ?? 0, 2),
    });
  };

  const generateTableHeader = () => {
    return (
      <Table.Header>
        <Table.HeaderColumn className="capitalize bg-background-200">
          {translateAggregateOn(data?.aggregatedOn, t)}
        </Table.HeaderColumn>
        <Table.HeaderColumn className="bg-background-200">
          {dayjs(measurementPoints?.[0]?.timestamp ?? '').format('YYYY')}
        </Table.HeaderColumn>
        {getValues().year && <Table.HeaderColumn className="bg-background-200">{getValues().year}</Table.HeaderColumn>}
      </Table.Header>
    );
  };

  const generateTableRow = (
    measurementType: MeasurementType,
    measurement: MeasurementPoints | MergedMeasurementPoints,
    index: number
  ) => {
    return (
      <Table.Row key={`${measurement.timestamp}-${measurement.value}-${index}`}>
        <Table.Column>
          <p className="font-bold">{formatDate(measurement.timestamp ?? '')} </p>
        </Table.Column>
        <Table.Column>
          {measurementType === MeasurementType.CONSUMPTION
            ? translateConsumptionAmount(measurement.value)
            : translateTemperatureAmount(measurement.value)}
        </Table.Column>
        {getValues().year && (
          <Table.Column>
            {measurementType === MeasurementType.CONSUMPTION
              ? translateConsumptionAmount((measurement as MergedMeasurementPoints).previousValue)
              : translateTemperatureAmount((measurement as MergedMeasurementPoints).previousValue)}
          </Table.Column>
        )}
      </Table.Row>
    );
  };

  return (
    <Table background>
      {generateTableHeader()}
      <Table.Body>
        {measurementPoints?.map((measurement, index) =>
          generateTableRow(
            isConsumption ? MeasurementType.CONSUMPTION : MeasurementType.TEMPERATURE,
            measurement,
            index
          )
        )}
      </Table.Body>
    </Table>
  );
};
