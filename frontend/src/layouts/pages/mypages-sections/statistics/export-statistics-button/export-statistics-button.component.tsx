'use client';

import { Download } from 'lucide-react';
import { Button, useSnackbar } from '@sk-web-gui/react';
import {
  MeasurementPoints,
  MergedMeasurementPoints,
  MergedStatisticsMeasurementData,
  StatisticsMeasurementData,
} from '@interfaces/measurement-data';
import { useFormContext } from 'react-hook-form';
import { utils, writeFile } from 'xlsx';
import dayjs, { OpUnitType } from 'dayjs';
import { translateAggregateOn } from '@services/measurement-data-service';
import { useTranslation } from 'react-i18next';
import { Event } from '@data-contracts/backend/data-contracts';
import { queryClient, useApi } from '@services/api-service';
import { getEventCategory } from '@utils/facility';
import { createLogEventData } from '@interfaces/event';

export interface ExportStatisticsButtonProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  isFetching: boolean;
}
export const ExportStatisticsButton = (props: ExportStatisticsButtonProps) => {
  const { data, isFetching } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation(['statistics', 'event']);
  const toastMessage = useSnackbar();

  const logExport = useApi<Event>({
    url: '/event/create',
    method: 'post',
  });

  const exportStatistics = () => {
    if (data?.measurementData && data?.aggregatedOn) {
      const exportInformationHeadings = [
        ['Anläggnings-id', 'Adress', 'Kategori', 'Tidpunkt för export', 'Starttidpunkt', 'Sluttidpunkt', 'Detaljnivå'],
      ];
      const exportDataHeadings = [
        [
          'Från',
          'Till',
          `Förbrukning ${dayjs(getValues().fromDate).format('YYYY')} (kWh)`,
          getValues().year && `Förbrukning ${getValues().year} (kWh)`,
        ],
      ];

      const exportInformation = [
        {
          facilityId: getValues().facilityId,
          facilityAddress: getValues().address,
          category: getValues().category,
          exportTimestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          fromDate: getValues().fromDate,
          toDate: getValues().toDate,
          aggregation: translateAggregateOn(data?.aggregatedOn).toUpperCase(),
        },
      ];

      const logInformation: createLogEventData[] = [
        {
          facilityId: getValues().facilityId,
          facilityAddress: getValues().address,
          fromDate: dayjs(getValues().fromDate).utc(true).toISOString(),
          toDate: dayjs(getValues().toDate).utc(true).toISOString(),
          category: getEventCategory(getValues().category),
          aggregation: data.aggregatedOn,
          year: getValues().year,
        },
      ];

      logExport
        .mutateAsync(logInformation)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['events'] });
        })
        .catch(() =>
          toastMessage({
            message: t('event:error.create'),
            status: 'error',
          })
        );

      const exportData =
        data?.measurementData?.[0].measurementPoints?.map(
          (measurement: MeasurementPoints | MergedMeasurementPoints) => {
            return {
              fromDate: dayjs(measurement.timestamp).format('YYYY-MM-DD HH:mm'),
              toDate: dayjs(measurement?.timestamp)
                .endOf(data?.aggregatedOn as unknown as OpUnitType)
                .format('YYYY-MM-DD HH:ss'),
              consumption: measurement.value,
              previousConsumption: 'previousValue' in measurement ? measurement?.previousValue : '',
            };
          }
        ) ?? [];

      const wb = utils.book_new();

      const ws = utils.json_to_sheet([]);
      utils.sheet_add_aoa(ws, exportInformationHeadings);
      utils.sheet_add_json(ws, exportInformation, { origin: 'A2', skipHeader: true });
      utils.sheet_add_aoa(ws, exportDataHeadings, { origin: 'A5' });
      utils.sheet_add_json(ws, exportData, { origin: 'A6', skipHeader: true });
      utils.book_append_sheet(wb, ws, 'Data');
      writeFile(wb, `Export-${getValues().address}-${getValues().category}-${dayjs().format('YYYY-MM-DD')}.xlsx`);
    }
  };

  return (
    <Button
      size="lg"
      rightIcon={<Download />}
      disabled={isFetching || !data?.measurementData?.length}
      onClick={() => exportStatistics()}
      className="lg:w-auto w-full"
      data-cy="export-statistics-button"
    >
      {t('statistics:export')}
    </Button>
  );
};
