import React from 'react';
import dayjs from 'dayjs';
import { Aggregation, Months } from '@interfaces/measurement-data';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { previousValue?: number }; name: string }[];
  label?: keyof typeof Months;
  fromDate: string;
  year?: number;
  isConsumption: boolean;
  aggregatedOn?: Aggregation;
}

export default function CustomTooltip({
  active,
  payload,
  label,
  fromDate,
  year,
  isConsumption,
  aggregatedOn,
}: CustomTooltipProps) {
  const formatDate = () => {
    switch (aggregatedOn) {
      case 'HOUR':
        return (
          <strong>
            {dayjs(fromDate).format('D MMMM').toLowerCase()} kl {label}.00
          </strong>
        );
      case 'DAY':
        return (
          <strong>
            {label} {dayjs(fromDate).format('MMMM').toLowerCase()}
          </strong>
        );
      case 'MONTH':
        return <strong>{!!label && Months[label]}</strong>;
      default:
        return '';
    }
  };

  const formatted = (value: number) =>
    new Intl.NumberFormat('se', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);

  if (active && payload?.length) {
    return (
      <div className="shadow-100 rounded-cards px-24 py-14 bg-background-content">
        {formatDate()}

        {payload[0]?.name === 'value' && (
          <p>
            <strong>{dayjs(fromDate).format('YYYY')}:</strong> {formatted(payload[0].value)}{' '}
            {isConsumption ? 'kWh' : 'ºC'}
          </p>
        )}

        {year && payload[0]?.name === 'previousValue' && (
          <p>
            <strong>{year}:</strong> {formatted(payload[0]?.payload?.previousValue ?? 0)} {isConsumption ? 'kWh' : 'ºC'}
          </p>
        )}

        {year && payload[1]?.name === 'previousValue' && (
          <p>
            <strong>{year}:</strong> {formatted(payload[1]?.payload?.previousValue ?? 0)} {isConsumption ? 'kWh' : 'ºC'}
          </p>
        )}
      </div>
    );
  }

  return null;
}
