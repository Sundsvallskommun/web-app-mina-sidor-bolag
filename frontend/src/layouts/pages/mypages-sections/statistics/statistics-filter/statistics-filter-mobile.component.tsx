'use client';

import { Accordion, Button, Icon, Modal } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ListFilter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatisticsFilterAccordionItem } from './components/statistics-filter-accordion-item.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { FacilityCheckboxGroup } from './components/mobile/facility-checkbox-group.component';
import { FilterRadioGroup, FilterRadioOption } from './components/mobile/filter-radio-group.component';
import { isNormalYear, NORMAL_YEAR } from '@utils/normal-year';
import { FacilityType } from '@utils/facility';
import { canCompareWithNormalYear, StatisticsFilterMode } from './statistics-filter.rules';
import {
  StatisticsFilterDraftProvider,
  useApplyStatisticsFilterDraft,
  useComparableYears,
  useFacilityOptions,
  useStatisticsFilter,
  useStatisticsPeriod,
} from './statistics-filter.store';

export const StatisticsFilterMobile = () => {
  const { t } = useTranslation(['common', 'statistics']);
  const [isOpen, setIsOpen] = useState(false);
  const [draftKey, setDraftKey] = useState(0);

  const openHandler = () => {
    setDraftKey((key) => key + 1);
    setIsOpen(true);
  };
  const closeHandler = () => setIsOpen(false);

  return (
    <>
      <Button
        size="md"
        variant="secondary"
        className="sm:hidden w-full mt-24"
        onClick={openHandler}
        leftIcon={<Icon icon={<ListFilter />} />}
      >
        {t('statistics:filter')}
      </Button>

      <Modal
        className="sm:hidden flex flex-col w-full left-0 bottom-0 fixed rounded-0 rounded-t-cards max-h-[95dvh] pb-24"
        disableCloseOutside={true}
        style={{ zIndex: 60 }}
        show={isOpen}
        onClose={closeHandler}
        label={t('statistics:toFilter')}
      >
        <Modal.Content className="overflow-y-auto min-h-0">
          <StatisticsFilterDraftProvider key={draftKey}>
            <StatisticsFilterMobileContent closeHandler={closeHandler} />
          </StatisticsFilterDraftProvider>
        </Modal.Content>
      </Modal>
    </>
  );
};

const StatisticsFilterMobileContent = ({ closeHandler }: { closeHandler: () => void }) => {
  const { t } = useTranslation(['common', 'statistics']);

  const mode = useStatisticsFilter((state) => state.mode);
  const facilityType = useStatisticsFilter((state) => state.facilityType);
  const facilityIds = useStatisticsFilter((state) => state.facilityIds);
  const compareYear = useStatisticsFilter((state) => state.compareYear);
  const isHourQuarter = useStatisticsFilter((state) => state.isHourQuarter);
  const showNormalYear = useStatisticsFilter(canCompareWithNormalYear);
  const setFacilityType = useStatisticsFilter((state) => state.setFacilityType);
  const setFacilityIds = useStatisticsFilter((state) => state.setFacilityIds);
  const setMode = useStatisticsFilter((state) => state.setMode);
  const setCompareYear = useStatisticsFilter((state) => state.setCompareYear);
  const { availableFacilityTypes, groups, totalFacilities, hasOneFacility } = useFacilityOptions();
  const comparableYears = useComparableYears();
  const { fromDate } = useStatisticsPeriod();
  const applyDraft = useApplyStatisticsFilterDraft();

  const facilityTypeOptions: FilterRadioOption<FacilityType>[] = availableFacilityTypes.map((type) => ({
    value: type,
    label: type,
  }));

  const modeOptions: FilterRadioOption<StatisticsFilterMode>[] = [
    { value: 'year', label: t('statistics:year') },
    { value: 'month', label: t('statistics:month') },
    { value: 'day', label: t('statistics:day') },
  ];

  const compareYearOptions: FilterRadioOption<string>[] = [
    { value: '', label: t('statistics:compareYearNone') },
    ...comparableYears.map((year) => ({ value: year, label: year })),
    ...(showNormalYear ? [{ value: NORMAL_YEAR, label: t('statistics:normalYear') }] : []),
  ];

  const periodSubtitle = (() => {
    const d = dayjs(fromDate);
    if (mode === 'year') return d.format('YYYY');
    if (mode === 'month') return d.format('MMMM YYYY');
    return d.format('D MMMM YYYY');
  })();

  const compareYearSubtitle = (() => {
    if (!compareYear) return t('statistics:compareYearNone');
    if (isNormalYear(compareYear)) return t('statistics:normalYear');
    return compareYear;
  })();

  return (
    <div className="flex flex-col gap-24" data-cy="statistics-filter-mobile">
      <Accordion>
        {availableFacilityTypes.length > 1 && (
          <StatisticsFilterAccordionItem label={t('statistics:agreementType')} subtitle={facilityType ?? ''}>
            <div className="pl-6">
              <FilterRadioGroup
                name="facilityType-mobile"
                legend={t('statistics:agreementType')}
                options={facilityTypeOptions}
                value={facilityType ?? ('' as FacilityType)}
                onChange={setFacilityType}
                dataCy="facility-type-mobile"
              />
            </div>
          </StatisticsFilterAccordionItem>
        )}

        {!hasOneFacility && (
          <StatisticsFilterAccordionItem
            label={t('statistics:facility')}
            subtitle={t('statistics:selection', { count: facilityIds.length, total: totalFacilities })}
          >
            <div className="pl-6">
              <FacilityCheckboxGroup
                groups={groups}
                value={facilityIds}
                onChange={setFacilityIds}
                dataCy="facility-select-mobile"
              />
            </div>
          </StatisticsFilterAccordionItem>
        )}

        <StatisticsFilterAccordionItem label={t('statistics:showBy')} subtitle={periodSubtitle}>
          <div className="flex flex-col gap-16 pl-6">
            <FilterRadioGroup
              name="mode-mobile"
              legend={t('statistics:showBy')}
              options={modeOptions}
              value={mode}
              onChange={setMode}
              dataCy="date-toggle-mobile"
            />
            {mode === 'year' && <StatisticsFilterYear />}
            {mode === 'month' && <StatisticsFilterMonth />}
            {mode === 'day' && <StatisticsFilterDay />}
          </div>
        </StatisticsFilterAccordionItem>

        {!isHourQuarter && (
          <StatisticsFilterAccordionItem label={t('statistics:compareYear')} subtitle={compareYearSubtitle}>
            <div className="pl-6">
              <FilterRadioGroup
                name="compareYear-mobile"
                legend={t('statistics:compareYear')}
                options={compareYearOptions}
                value={compareYear}
                onChange={setCompareYear}
                dataCy="compare-year-select-mobile"
              />
            </div>
          </StatisticsFilterAccordionItem>
        )}
      </Accordion>

      <Button
        onClick={() => {
          applyDraft();
          closeHandler();
        }}
        size="lg"
        className="w-full"
        data-cy="statistics-filter-mobile-apply"
      >
        {t('statistics:use')}
      </Button>
    </div>
  );
};
