import { utils, writeFile } from 'xlsx';
import dayjs, { OpUnitType } from 'dayjs';
import { MeasurementPoints, StatisticsMeasurementData, Aggregation, Data } from '@interfaces/measurement-data';
import { statisticsMeasurementDataHandler, translateAggregateOn } from '@services/measurement-data-service';
import { ApiResponse, apiService } from '@services/api-service';
import { getEventCategory } from '@utils/facility';
import { CreateLogEventData } from '@interfaces/event';
import { ExportModalData } from './export-statistics-modal.component';
import { TFunction } from 'i18next';

export interface ExportStatisticsOptions {
  modalData: ExportModalData;
  t: TFunction;
}

export const buildLogInformation = (modalData: ExportModalData): CreateLogEventData[] => {
  const aggregation = modalData.timeResolution.toUpperCase() as Aggregation;
  return modalData.selectedFacilities.map((f) => ({
    facilityId: f.facilityId,
    facilityAddress: f.address,
    fromDate: dayjs(modalData.fromDate).utc(true).toISOString(),
    toDate: dayjs(modalData.toDate).utc(true).toISOString(),
    category: getEventCategory(modalData.category),
    aggregation,
  }));
};

export const exportStatisticsToExcel = async ({ modalData, t }: ExportStatisticsOptions): Promise<boolean> => {
  const aggregation = modalData.timeResolution.toUpperCase() as Aggregation;
  const fromDateParam = dayjs(modalData.fromDate).startOf('date').utc(true).format();
  const toDateParam = dayjs(modalData.toDate).endOf('date').utc(true).format();

  const wb = utils.book_new();

  for (const facility of modalData.selectedFacilities) {
    const params = new URLSearchParams({
      category: modalData.category,
      facilityId: facility.facilityId,
      fromDate: fromDateParam,
      toDate: toDateParam,
      aggregateOn: aggregation,
    });

    let facilityData: StatisticsMeasurementData | undefined;
    try {
      const response = await apiService.get<ApiResponse<Data>>(`/measurementdata?${params.toString()}`);
      facilityData = statisticsMeasurementDataHandler(response.data.data);
    } catch {
      continue;
    }

    const exportInformationHeadings = [
      ['Anläggnings-id', 'Adress', 'Kategori', 'Tidpunkt för export', 'Starttidpunkt', 'Sluttidpunkt', 'Detaljnivå'],
    ];
    const exportDataHeadings = [['Från', 'Till', `Förbrukning ${dayjs(modalData.fromDate).format('YYYY')} (kWh)`]];

    const exportInformation = [
      {
        facilityId: facility.facilityId,
        facilityAddress: facility.address,
        category: modalData.category,
        exportTimestamp: dayjs().format('YYYY-MM-DD HH:mm'),
        fromDate: modalData.fromDate,
        toDate: modalData.toDate,
        aggregation: translateAggregateOn(aggregation, t).toUpperCase(),
      },
    ];

    const exportData =
      facilityData?.measurementData?.[0]?.measurementPoints?.map((measurement: MeasurementPoints) => ({
        fromDate: dayjs(measurement.timestamp).format('YYYY-MM-DD HH:mm'),
        toDate: dayjs(measurement?.timestamp)
          .endOf(aggregation.toLowerCase() as OpUnitType)
          .format('YYYY-MM-DD HH:ss'),
        consumption: measurement.value,
      })) ?? [];

    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, exportInformationHeadings);
    utils.sheet_add_json(ws, exportInformation, { origin: 'A2', skipHeader: true });
    utils.sheet_add_aoa(ws, exportDataHeadings, { origin: 'A5' });
    utils.sheet_add_json(ws, exportData, { origin: 'A6', skipHeader: true });

    const sheetName = facility.facilityId.slice(0, 31);
    utils.book_append_sheet(wb, ws, sheetName);
  }

  if (wb.SheetNames.length > 0) {
    writeFile(wb, `Export-${modalData.category}-${dayjs().format('YYYY-MM-DD')}.xlsx`);
    return true;
  }

  return false;
};
