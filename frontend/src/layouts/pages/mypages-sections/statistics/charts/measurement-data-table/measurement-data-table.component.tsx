import React from 'react';
import { Table } from '@sk-web-gui/react';
import {
  MergedMeasurementPoints,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
} from '@interfaces/measurement-data';
import { translateAggregateOn } from '@services/measurement-data-service';
import { useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import { toFixedNumber } from '@react-stately/utils';

export interface MeasurementDataTableProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  isConsumption: boolean;
}

export const MeasurementDataTable = (props: MeasurementDataTableProps) => {
  const { data, isConsumption } = props;
  const { getValues } = useFormContext();

  const formatDate = (timestamp: string) => {
    switch (data?.aggregatedOn) {
      case 'HOUR':
        return dayjs(timestamp).format('HH:mm');
      case 'DAY':
        return dayjs(timestamp).format('D MMMM').toLowerCase();
      case 'MONTH':
        return dayjs(timestamp).format('MMMM');
      default:
        return 'Datum saknas';
    }
  };

  const rows = isConsumption
    ? data?.measurementData?.[0]?.measurementPoints?.map((measurement) => {
        return (
          <Table.Row key={`${measurement.timestamp}-${measurement.value}`}>
            <Table.Column>
              <p className="font-bold">{formatDate(measurement.timestamp ?? '')} </p>
            </Table.Column>
            <Table.Column>{toFixedNumber(measurement.value ?? 0, 2)} kWh</Table.Column>
            {getValues().year && (
              <Table.Column>
                {toFixedNumber((measurement as MergedMeasurementPoints)?.previousValue ?? 0, 2)} kWh
              </Table.Column>
            )}
          </Table.Row>
        );
      })
    : data?.temperatureData?.[0]?.measurementPoints?.map((temperature) => {
        return (
          <Table.Row key={`${temperature.timestamp}-${temperature.value}`}>
            <Table.Column>
              <p className="font-bold">{formatDate(temperature.timestamp ?? '')} </p>
            </Table.Column>
            <Table.Column>{temperature.value}°C</Table.Column>
            {getValues().year && (
              <Table.Column>{(temperature as MergedMeasurementPoints).previousValue}°C</Table.Column>
            )}
          </Table.Row>
        );
      });

  return (
    <Table background>
      <Table.Header>
        <Table.HeaderColumn className="capitalize bg-background-200">
          {translateAggregateOn(data?.aggregatedOn)}
        </Table.HeaderColumn>
        <Table.HeaderColumn className="bg-background-200">
          {dayjs(data?.measurementData?.[0].measurementPoints?.[0].timestamp ?? '').format('YYYY')}
        </Table.HeaderColumn>
        {getValues().year && <Table.HeaderColumn className="bg-background-200">{getValues().year}</Table.HeaderColumn>}
      </Table.Header>
      <Table.Body>
        {rows?.map((row) => {
          return row;
        })}
      </Table.Body>
    </Table>
  );
};
