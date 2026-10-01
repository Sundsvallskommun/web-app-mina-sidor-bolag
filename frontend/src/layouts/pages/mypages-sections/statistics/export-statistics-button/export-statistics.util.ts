import writeXlsxFile, { Column, Sheet, getSheetData } from 'write-excel-file/browser';
import dayjs, { OpUnitType } from 'dayjs';
import { MeasurementPoints, StatisticsMeasurementData, Aggregation, Data } from '@interfaces/measurement-data';
import { statisticsMeasurementDataHandler, translateAggregateOn } from '@services/measurement-data-service';
import { ApiResponse, apiService } from '@services/api-service';
import { CreateLogEventData } from '@interfaces/event';
import { ExportModalData } from './export-statistics-modal.component';
import { TFunction } from 'i18next';
import { DatePeriod } from './date-picker.util';

/** Maps a date period to the corresponding aggregation level used for the export. */
export const aggregationByPeriod: Partial<Record<DatePeriod, string>> = {
  year: 'month',
  month: 'day',
};

export interface ExportStatisticsOptions {
  modalData: ExportModalData;
  t: TFunction;
}

interface ExportInformation {
  facilityId: string;
  facilityAddress: string;
  category: string;
  exportTimestamp: string;
  fromDate: string;
  toDate: string;
  aggregation: string;
}

interface ExportDataRow {
  fromDate: string;
  toDate: string;
  consumption: number | undefined;
  temperature: number | undefined;
}

export const buildLogInformation = (modalData: ExportModalData): CreateLogEventData[] => {
  const aggregation = modalData.timeResolution.toUpperCase() as Aggregation;
  return modalData.selectedFacilities.map((f) => ({
    facilityId: f.facilityId,
    facilityAddress: f.address,
    fromDate: dayjs(modalData.fromDate).format(),
    toDate: dayjs(modalData.toDate).format(),
    category: modalData.category,
    aggregation,
  }));
};

export const exportStatisticsToExcel = async ({ modalData, t }: ExportStatisticsOptions): Promise<boolean> => {
  const aggregation = modalData.timeResolution.toUpperCase() as Aggregation;
  const fromDateParam = dayjs(modalData.fromDate).startOf('date').format();
  const toDateEndOfByAggregation: Partial<Record<Aggregation, OpUnitType>> = {
    [Aggregation.MONTH]: 'year',
    [Aggregation.DAY]: 'month',
  };
  const toDateEndOf: OpUnitType = toDateEndOfByAggregation[aggregation] ?? 'date';
  const toDateParam = dayjs(modalData.toDate).endOf(toDateEndOf).format();
  const excelMaxSheetName = 31;
  const sheets: Sheet<File | Blob | ArrayBuffer>[] = [];

  const params = new URLSearchParams();
  params.append('category', modalData.category);
  modalData.selectedFacilities.forEach((f) => params.append('facilityIds', f.facilityId));
  params.append('fromDate', fromDateParam);
  params.append('toDate', toDateParam);
  params.append('aggregateOn', aggregation);

  let data: Data | undefined;
  try {
    const response = await apiService.get<ApiResponse<Data>>(`/measurementdata?${params}`);
    data = response.data.data;
  } catch {
    return false;
  }

  const dataForFacility = (facilityId: string): Data => ({
    ...data,
    measurementSeries: (data?.measurementSeries ?? []).filter((s) => s.facilityId === facilityId),
  });

  for (const facility of modalData.selectedFacilities) {
    const facilityData: StatisticsMeasurementData = statisticsMeasurementDataHandler(
      dataForFacility(facility.facilityId)
    );

    const exportInformationColumns: Column<ExportInformation>[] = [
      { header: t('statistics:exportModal.excelHeadings.facilityId'), cell: (row) => row.facilityId },
      { header: t('statistics:exportModal.excelHeadings.address'), cell: (row) => row.facilityAddress },
      { header: t('statistics:exportModal.excelHeadings.category'), cell: (row) => row.category },
      { header: t('statistics:exportModal.excelHeadings.exportTimestamp'), cell: (row) => row.exportTimestamp },
      { header: t('statistics:exportModal.excelHeadings.startDate'), cell: (row) => row.fromDate },
      { header: t('statistics:exportModal.excelHeadings.endDate'), cell: (row) => row.toDate },
      { header: t('statistics:exportModal.excelHeadings.detailLevel'), cell: (row) => row.aggregation },
    ];
    const exportDataColumns: Column<ExportDataRow>[] = [
      { header: t('statistics:exportModal.excelHeadings.from'), cell: (row) => row.fromDate },
      { header: t('statistics:exportModal.excelHeadings.to'), cell: (row) => row.toDate },
      {
        header: t('statistics:exportModal.excelHeadings.consumption', {
          year: dayjs(modalData.fromDate).format('YYYY'),
          unit: facilityData.unit,
        }),
        cell: (row) => row.consumption,
      },
      ...(modalData.temperatureIncluded
        ? [
            {
              header: t('statistics:exportModal.excelHeadings.temperature'),
              cell: (row: ExportDataRow) => row.temperature,
            },
          ]
        : []),
    ];

    const exportInformation: ExportInformation = {
      facilityId: facility.facilityId,
      facilityAddress: facility.address,
      category: t(`statistics:exportModal.category.${modalData.category}`),
      exportTimestamp: dayjs().format('YYYY-MM-DD HH:mm'),
      fromDate: modalData.fromDate,
      toDate: modalData.toDate,
      aggregation: translateAggregateOn(aggregation, t).toUpperCase(),
    };

    const temperatureLookup = new Map<string, number | undefined>(
      (facilityData?.temperatureData?.[0]?.measurementPoints ?? []).map((tp) => [tp.timestamp ?? '', tp.value])
    );

    const mapQuarterRows = (measurement: MeasurementPoints): ExportDataRow[] =>
      (measurement.values ?? []).map((quarterValue, index) => {
        const from = dayjs(measurement.timestamp).add(index * 15, 'minute');
        return {
          fromDate: from.format('YYYY-MM-DD HH:mm'),
          toDate: from.add(14, 'minute').format('YYYY-MM-DD HH:mm'),
          consumption: quarterValue,
          temperature: temperatureLookup.get(measurement.timestamp ?? ''),
        };
      });

    const mapMeasurementRow = (measurement: MeasurementPoints): ExportDataRow => ({
      fromDate: dayjs(measurement.timestamp).format('YYYY-MM-DD HH:mm'),
      toDate: dayjs(measurement.timestamp)
        .endOf(aggregation.toLowerCase() as OpUnitType)
        .format('YYYY-MM-DD HH:mm'),
      consumption: measurement.value,
      temperature: temperatureLookup.get(measurement.timestamp ?? ''),
    });

    const measurementPoints = facilityData?.measurementData?.[0]?.measurementPoints ?? [];
    const exportData = measurementPoints.flatMap((measurement: MeasurementPoints) =>
      aggregation === Aggregation.QUARTER && measurement.values?.length
        ? mapQuarterRows(measurement)
        : [mapMeasurementRow(measurement)]
    );

    sheets.push({
      sheet: facility.facilityId.slice(0, excelMaxSheetName),
      data: [
        ...getSheetData([exportInformation], exportInformationColumns),
        [],
        [],
        ...getSheetData(exportData, exportDataColumns),
      ],
    });
  }

  if (sheets.length > 0) {
    const categoryLabel = t('statistics:exportModal.category.' + modalData.category);
    const filename = 'Export-' + categoryLabel + '-' + dayjs().format('YYYY-MM-DD') + '.xlsx';
    await writeXlsxFile(sheets).toFile(filename);
    return true;
  }

  return false;
};
