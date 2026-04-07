'use client';

import {
  Button,
  Checkbox,
  FormErrorMessage,
  FormLabel,
  Modal,
  RadioButton,
  Select,
  FormControl,
} from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CustomDatePicker } from './custom-date-picker.component';
import { DatePeriodToggle } from './date-period-toggle.component';
import { FacilitiesAccordion } from './facilities-accordion.component';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { Category } from '@interfaces/measurement-data';
import {
  DatePeriod,
  getDatePickerType,
  formatDateForInputType,
  adaptStartDate,
  adaptEndDate,
  getInitialDatePeriod,
  getInitialTimeInterval,
} from './date-picker.util';
import { aggregationByPeriod } from './export-statistics.util';

const categories = [Category.DISTRICT_HEATING, Category.ELECTRICITY];
const timeIntervals = ['hour', 'quarter'];

export interface ExportModalData {
  category: Category;
  fromDate: string;
  toDate: string;
  timeResolution: string;
  selectedFacilities: Array<{ facilityId: string; address: string }>;
  temperatureIncluded: boolean;
}

interface ExportStatisticsModalProps {
  show: boolean;
  onClose: () => void;
  onExport: (data: ExportModalData) => void;
  initialCategory?: Category;
  initialFromDate?: string;
  initialToDate?: string;
  initialTimeResolution?: string;
  initialFacilityId?: string;
}

export const ExportStatisticsModal = ({
  show,
  onClose,
  onExport,
  initialCategory,
  initialFromDate,
  initialToDate,
  initialTimeResolution,
  initialFacilityId,
}: ExportStatisticsModalProps) => {
  const [temperatureIncluded, setTemperatureIncluded] = useState(false);
  const [checkedFacilities, setCheckedFacilities] = useState<Set<string>>(new Set());
  const [checkedFacilitiesCount, setCheckedFacilitiesCount] = useState(0);
  const [totalFacilitiesCount, setTotalFacilitiesCount] = useState(0);
  const [category, setCategory] = useState<Category>(initialCategory ?? categories[0]);
  const [fromDate, setFromDate] = useState(initialFromDate ?? '');
  const [toDate, setToDate] = useState(initialToDate ?? '');
  const [datePeriod, setDatePeriod] = useState<DatePeriod>(() => getInitialDatePeriod(initialTimeResolution));
  const [timeInterval, setTimeInterval] = useState<'hour' | 'quarter'>(() =>
    getInitialTimeInterval(initialTimeResolution)
  );
  const { t } = useTranslation(['statistics']);

  const handleFacilitySelectionChange = useCallback((items: Set<string>, count: number, total: number) => {
    setCheckedFacilities(items);
    setCheckedFacilitiesCount(count);
    setTotalFacilitiesCount(total);
  }, []);

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  useEffect(() => {
    if (!show) return;
    const initialPeriod = getInitialDatePeriod(initialTimeResolution);
    const inputType = getDatePickerType(initialPeriod);
    setCategory(initialCategory ?? categories[0]);
    setDatePeriod(initialPeriod);
    setTimeInterval(getInitialTimeInterval(initialTimeResolution));
    setFromDate(formatDateForInputType(initialFromDate ?? '', inputType));
    setToDate(formatDateForInputType(initialToDate ?? '', inputType));
    setTemperatureIncluded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const datePickerType = getDatePickerType(datePeriod);

  const aggregation = aggregationByPeriod[datePeriod] ?? timeInterval;

  const handleExport = () => {
    const selectedFacilities = Array.from(checkedFacilities).map((key) => {
      const [address, facilityId] = key.split('::');
      return { facilityId, address };
    });
    onExport({
      category,
      fromDate,
      toDate,
      timeResolution: aggregation,
      selectedFacilities,
      temperatureIncluded,
    });
  };

  const handleDatePeriodChange = (period: DatePeriod) => {
    const oldType = getDatePickerType(datePeriod);
    const newType = getDatePickerType(period);
    setDatePeriod(period);
    if (period !== 'day') setTimeInterval('hour');
    if (oldType === newType) return;
    setFromDate(adaptStartDate(fromDate, oldType, newType));
    setToDate(adaptEndDate(toDate, oldType, newType));
  };

  const dateRangeInvalid = !!fromDate && !!toDate && fromDate > toDate;
  const isValid = checkedFacilitiesCount > 0 && !!fromDate && !!toDate && !dateRangeInvalid;
  const showTimeIntervalOption = datePeriod === 'day' && category === Category.ELECTRICITY;

  return (
    <Modal
      label={t('statistics:exportModal.title')}
      show={show}
      onClose={onClose}
      className="lg:w-[720px] w-[395px] max-w-[calc(100vw-0.8rem)]"
    >
      <Modal.Content>
        <div className="flex flex-col gap-40 items-start self-stretch px-0 pt-8 pb-16">
          <FormControl id="export-category" name="category" className="lg:w-[276px] w-full">
            <FormLabel className="text-label-medium">{t('statistics:exportModal.category.title')}</FormLabel>
            <Select
              className="self-stretch w-full"
              value={category}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Category)}
              data-cy="export-category-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`statistics:exportModal.category.${cat}`)}
                </option>
              ))}
            </Select>
          </FormControl>

          <div className="lg:pt-0 pt-16 lg:justify-end justify-center lg:flex-[0_0_auto] w-full lg:w-auto">
            <div className="flex flex-col gap-8 w-full lg:pt-0 pt-16">
              <FormLabel>{t('statistics:exportBy')}</FormLabel>
              <DatePeriodToggle value={datePeriod} onChange={handleDatePeriodChange} />
            </div>
          </div>

          <FormControl className="w-full" invalid={dateRangeInvalid}>
            <FormLabel className="text-label-medium">{t('statistics:exportModal.chooseTimePeriod')}</FormLabel>
            <div className="flex lg:flex-row flex-col items-start gap-40 self-stretch">
              <div className="flex flex-col justify-center items-start gap-8 lg:flex-1 self-stretch">
                <FormLabel className="text-label-medium">{t('statistics:exportModal.from')}</FormLabel>
                <CustomDatePicker type={datePickerType} value={fromDate} onChange={setFromDate} />
              </div>
              <div className="flex flex-col justify-center items-start gap-8 lg:flex-1 self-stretch">
                <FormLabel className="text-label-medium">{t('statistics:exportModal.to')}</FormLabel>
                <CustomDatePicker type={datePickerType} value={toDate} onChange={setToDate} />
              </div>
            </div>
            {dateRangeInvalid && (
              <FormErrorMessage className="text-error text-small mt-4">
                {t('statistics:exportModal.dateRangeError')}
              </FormErrorMessage>
            )}
          </FormControl>
          {showTimeIntervalOption && (
            <FormControl fieldset name="timeInterval">
              <FormLabel className="text-label-medium">{t('statistics:exportModal.timeInterval')}</FormLabel>
              <div className="flex lg:flex-row flex-col items-start gap-16">
                {timeIntervals.map((interval) => (
                  <RadioButton
                    key={interval}
                    value={interval}
                    name="timeInterval"
                    checked={timeInterval === interval}
                    onChange={() => {
                      setTimeInterval(interval as 'hour' | 'quarter');
                    }}
                  >
                    {t(`statistics:exportModal.timeResolution.${interval}`)}
                  </RadioButton>
                ))}
              </div>
            </FormControl>
          )}
          <div className="w-full">
            <FacilitiesAccordion
              show={show}
              user={user}
              category={category}
              initialFacilityId={initialFacilityId}
              onSelectionChange={handleFacilitySelectionChange}
            />
          </div>
          <div className="w-full">
            <Checkbox checked={temperatureIncluded} onChange={() => setTemperatureIncluded((prev) => !prev)}>
              {t('statistics:exportModal.includeTemperature')}
            </Checkbox>
          </div>
          <p className="my-0">
            {t('statistics:exportModal.exportComment', {
              count: checkedFacilitiesCount,
              total: totalFacilitiesCount,
            })}
          </p>
        </div>
      </Modal.Content>
      <Modal.Footer className="w-full flex flex-row lg:items-start items-center gap-16 self-stretch justify-start">
        <Button
          variant="secondary"
          className="lg:flex-none flex-1"
          onClick={onClose}
          data-cy="export-modal-cancel-button"
        >
          {t('statistics:exportModal.cancel')}
        </Button>
        <Button
          variant="primary"
          className="lg:flex-none flex-1"
          onClick={handleExport}
          disabled={!isValid}
          data-cy="export-modal-confirm-button"
        >
          {t('statistics:exportModal.export')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
