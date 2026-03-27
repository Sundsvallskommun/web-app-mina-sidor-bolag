'use client';

import { Download } from 'lucide-react';
import { Button, useSnackbar } from '@sk-web-gui/react';
import { MergedStatisticsMeasurementData, StatisticsMeasurementData } from '@interfaces/measurement-data';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EventResponse } from '@data-contracts/backend/data-contracts';
import { queryClient, useApi } from '@services/api-service';
import { getCategoryFromInstalledBaseType } from '@utils/facility';
import { useState } from 'react';
import { Category } from '@interfaces/measurement-data';
import { ExportModalData, ExportStatisticsModal } from './export-statistics-modal.component';
import { buildLogInformation, exportStatisticsToExcel } from './export-statistics.util';

export interface ExportStatisticsButtonProps {
  data: StatisticsMeasurementData | MergedStatisticsMeasurementData | undefined;
  isFetching: boolean;
}
export const ExportStatisticsButton = (props: ExportStatisticsButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const { data, isFetching } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation(['statistics', 'event']);
  const toastMessage = useSnackbar();

  const logExport = useApi<EventResponse>({
    url: '/event/create',
    method: 'post',
  });

  const exportStatistics = async (modalData: ExportModalData) => {
    const logInformation = buildLogInformation(modalData);

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

    const success = await exportStatisticsToExcel({
      modalData,
      t,
    });

    if (!success) {
      toastMessage({
        message: t('statistics:exportError'),
        status: 'error',
      });
    }
  };

  return (
    <div className="lg:w-auto w-full">
      <Button
        size="lg"
        rightIcon={<Download />}
        disabled={isFetching || !data?.measurementData?.length}
        onClick={() => setShowModal(true)}
        className="lg:w-auto w-full"
        data-cy="export-statistics-button"
      >
        {t('statistics:export')}
      </Button>
      <ExportStatisticsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onExport={exportStatistics}
        initialCategory={(getCategoryFromInstalledBaseType(getValues().category) as Category) || undefined}
        initialFromDate={getValues().fromDate}
        initialToDate={getValues().toDate}
        initialTimeResolution={data?.aggregatedOn?.toLowerCase()}
        initialFacilityId={getValues().facilityId}
      />
    </div>
  );
};
