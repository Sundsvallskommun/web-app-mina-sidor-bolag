import React, { useMemo } from 'react';
import { Table } from '@sk-web-gui/react';
import {
  Aggregation,
  MergedMeasurementPoints,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
  TemperatureMeasurementPoints,
} from '@interfaces/measurement-data';
import {
  addTemperatureToMeasurementPoints,
  canShowTemperature,
  findTemperature,
  translateAggregateOn,
} from '@services/measurement-data-service';
import { useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import { toFixedNumber } from '@utils/to-fixed-number';
import { useTranslation } from 'react-i18next';
import { isNormalYear } from '@utils/normal-year';

export interface MeasurementDataTableProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  showTemperature?: boolean;
}

export const MeasurementDataTable = (props: MeasurementDataTableProps) => {
  const { data, showTemperature: showTemperatureProp = false } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation('statistics');

  const year = getValues().year;
  const showComparisonColumn = !!year;
  const showTemperature = showTemperatureProp && canShowTemperature(data);
  const showPreviousTemperature = showTemperature && showComparisonColumn && !isNormalYear(year);

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
    if (!data) {
      return undefined;
    }
    const points = addTemperatureToMeasurementPoints(data);

    if (data.aggregatedOn === Aggregation.QUARTER && points?.[0]?.values?.length) {
      const quarterPoints: TemperatureMeasurementPoints[] = points.flatMap((point) => {
        if (point.values) {
          return point.values.map((value, index) => {
            const timestamp = dayjs(point.timestamp)
              .add(index * 15, 'minute')
              .toISOString();
            const temperature = findTemperature(data.temperatureData, timestamp, 'MM-DD HH:mm') ?? point.temperature;
            return { value, timestamp, temperature } as TemperatureMeasurementPoints;
          });
        }
        return [];
      });

      return quarterPoints;
    }

    return points;
  }, [data]);

  const translateConsumptionAmount = (value?: number) => {
    return t('statistics:consumption.amount', {
      consumption: toFixedNumber(value ?? 0, 2),
      unit: data?.unit,
    });
  };
  const translateTemperatureAmount = (value?: number) => {
    if (value === undefined) {
      return '–';
    }
    return t('statistics:consumption.temperature', {
      temperature: toFixedNumber(value, 2),
    });
  };

  const currentYear = dayjs(measurementPoints?.[0]?.timestamp ?? '').format('YYYY');
  const temperatureTitle = (temperatureYear: string) =>
    t('statistics:temperature.titleWithYear', { year: temperatureYear });

  const generateTableHeader = () => {
    return (
      <Table.Header>
        <Table.HeaderColumn className="capitalize bg-background-200">
          {translateAggregateOn(data?.aggregatedOn, t)}
        </Table.HeaderColumn>
        <Table.HeaderColumn className="bg-background-200">{currentYear}</Table.HeaderColumn>
        {showComparisonColumn && (
          <Table.HeaderColumn className="bg-background-200">
            {isNormalYear(year) ? t('statistics:consumption.correctedConsumption') : year}
          </Table.HeaderColumn>
        )}
        {showTemperature && (
          <Table.HeaderColumn className="bg-background-200">{temperatureTitle(currentYear)}</Table.HeaderColumn>
        )}
        {showPreviousTemperature && (
          <Table.HeaderColumn className="bg-background-200">{temperatureTitle(year)}</Table.HeaderColumn>
        )}
      </Table.Header>
    );
  };

  const generateTableRow = (measurement: TemperatureMeasurementPoints, index: number) => {
    return (
      <Table.Row key={`${measurement.timestamp}-${measurement.value}-${index}`}>
        <Table.Column>
          <p className="font-bold">{formatDate(measurement.timestamp ?? '')} </p>
        </Table.Column>
        <Table.Column>{translateConsumptionAmount(measurement.value)}</Table.Column>
        {showComparisonColumn && (
          <Table.Column>
            {translateConsumptionAmount((measurement as MergedMeasurementPoints).previousValue)}
          </Table.Column>
        )}
        {showTemperature && <Table.Column>{translateTemperatureAmount(measurement.temperature)}</Table.Column>}
        {showPreviousTemperature && (
          <Table.Column>{translateTemperatureAmount(measurement.previousTemperature)}</Table.Column>
        )}
      </Table.Row>
    );
  };

  return (
    <Table background>
      {generateTableHeader()}
      <Table.Body>{measurementPoints?.map((measurement, index) => generateTableRow(measurement, index))}</Table.Body>
    </Table>
  );
};
