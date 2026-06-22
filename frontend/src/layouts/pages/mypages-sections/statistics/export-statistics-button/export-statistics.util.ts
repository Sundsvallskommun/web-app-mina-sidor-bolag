import { utils, writeFile } from 'xlsx';
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
  const workbook = utils.book_new();

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

    const exportInformationHeadings = [
      [
        t('statistics:exportModal.excelHeadings.facilityId'),
        t('statistics:exportModal.excelHeadings.address'),
        t('statistics:exportModal.excelHeadings.category'),
        t('statistics:exportModal.excelHeadings.exportTimestamp'),
        t('statistics:exportModal.excelHeadings.startDate'),
        t('statistics:exportModal.excelHeadings.endDate'),
        t('statistics:exportModal.excelHeadings.detailLevel'),
      ],
    ];
    const exportDataHeadings = [
      [
        t('statistics:exportModal.excelHeadings.from'),
        t('statistics:exportModal.excelHeadings.to'),
        t('statistics:exportModal.excelHeadings.consumption', { year: dayjs(modalData.fromDate).format('YYYY') }),
        ...(modalData.temperatureIncluded ? [t('statistics:exportModal.excelHeadings.temperature')] : []),
      ],
    ];

    const exportInformation = [
      {
        facilityId: facility.facilityId,
        facilityAddress: facility.address,
        category: t(`statistics:exportModal.category.${modalData.category}`),
        exportTimestamp: dayjs().format('YYYY-MM-DD HH:mm'),
        fromDate: modalData.fromDate,
        toDate: modalData.toDate,
        aggregation: translateAggregateOn(aggregation, t).toUpperCase(),
      },
    ];

    const temperatureLookup = new Map<string, number | undefined>(
      (facilityData?.temperatureData?.[0]?.measurementPoints ?? []).map((tp) => [tp.timestamp ?? '', tp.value])
    );

    const withTemperature = (timestamp: string) =>
      modalData.temperatureIncluded ? { temperature: temperatureLookup.get(timestamp) } : {};

    const mapQuarterRows = (measurement: MeasurementPoints) =>
      (measurement.values ?? []).map((quarterValue, index) => {
        const from = dayjs(measurement.timestamp).add(index * 15, 'minute');
        return {
          fromDate: from.format('YYYY-MM-DD HH:mm'),
          toDate: from.add(14, 'minute').format('YYYY-MM-DD HH:mm'),
          consumption: quarterValue,
          ...withTemperature(measurement.timestamp ?? ''),
        };
      });

    const mapMeasurementRow = (measurement: MeasurementPoints) => ({
      fromDate: dayjs(measurement.timestamp).format('YYYY-MM-DD HH:mm'),
      toDate: dayjs(measurement.timestamp)
        .endOf(aggregation.toLowerCase() as OpUnitType)
        .format('YYYY-MM-DD HH:mm'),
      consumption: measurement.value,
      ...withTemperature(measurement.timestamp ?? ''),
    });

    const measurementPoints = facilityData?.measurementData?.[0]?.measurementPoints ?? [];
    const exportData = measurementPoints.flatMap((measurement: MeasurementPoints) =>
      aggregation === Aggregation.QUARTER && measurement.values?.length
        ? mapQuarterRows(measurement)
        : [mapMeasurementRow(measurement)]
    );

    const workSheet = utils.json_to_sheet([]);
    utils.sheet_add_aoa(workSheet, exportInformationHeadings);
    utils.sheet_add_json(workSheet, exportInformation, { origin: 'A2', skipHeader: true });
    utils.sheet_add_aoa(workSheet, exportDataHeadings, { origin: 'A5' });
    utils.sheet_add_json(workSheet, exportData, { origin: 'A6', skipHeader: true });

    const sheetName = facility.facilityId.slice(0, excelMaxSheetName);
    utils.book_append_sheet(workbook, workSheet, sheetName);
  }

  if (workbook.SheetNames.length > 0) {
    const categoryLabel = t('statistics:exportModal.category.' + modalData.category);
    const filename = 'Export-' + categoryLabel + '-' + dayjs().format('YYYY-MM-DD') + '.xlsx';
    writeFile(workbook, filename);
    return true;
  }

  return false;
};
