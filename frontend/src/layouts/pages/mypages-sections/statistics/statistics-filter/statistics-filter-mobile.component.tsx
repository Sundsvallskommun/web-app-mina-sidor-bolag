'use client';

import { Accordion, Button, Icon, Modal, Select } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ListFilter } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatisticsFilterAccordionItem } from './components/statistics-filter-accordion-item.component';
import { StatisticsFilterDay } from './components/statistics-filter-day.component';
import { StatisticsFilterMonth } from './components/statistics-filter-month.component';
import { StatisticsFilterYear } from './components/statistics-filter-year.component';
import { CompareYearSelect } from './components/compare-year-select.component';
import { FacilityCombobox } from './components/facility-combobox.component';
import { ModeSelect } from './components/mode-select.component';
import { isNormalYear } from '@utils/normal-year';
import { FacilityType } from '@utils/facility';
import { useFacilityOptions, useStatisticsFilter, useStatisticsPeriod } from './statistics-filter.store';

export const StatisticsFilterMobile = () => {
  const { t } = useTranslation(['common', 'statistics']);
  const [isOpen, setIsOpen] = useState(false);

  const closeHandler = () => setIsOpen(false);

  return (
    <>
      <Button
        size="md"
        variant="secondary"
        className="sm:hidden w-full mt-24"
        onClick={() => setIsOpen(true)}
        leftIcon={<Icon icon={<ListFilter />} />}
      >
        {t('statistics:filter')}
      </Button>

      <Modal
        className="sm:hidden block w-full left-0 bottom-0 fixed rounded-0 rounded-t-cards max-h-[95vh]"
        disableCloseOutside={true}
        show={isOpen}
        onClose={closeHandler}
        label={t('statistics:toFilter')}
      >
        <Modal.Content className="overflow-y-auto">
          <StatisticsFilterMobileContent closeHandler={closeHandler} />
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
  const setFacilityType = useStatisticsFilter((state) => state.setFacilityType);
  const setFacilityIds = useStatisticsFilter((state) => state.setFacilityIds);
  const { availableFacilityTypes, groups, optionsKey, totalFacilities, hasOneFacility } = useFacilityOptions();
  const { fromDate } = useStatisticsPeriod();

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
    <div className="flex flex-col gap-24 pb-24" data-cy="statistics-filter-mobile">
      <Accordion>
        {availableFacilityTypes.length > 1 && (
          <StatisticsFilterAccordionItem label={t('statistics:agreementType')} subtitle={facilityType ?? ''}>
            <div className="flex flex-col gap-12 pl-6">
              <Select
                className="w-full"
                data-cy={`facility-type-mobile-${facilityType}`}
                value={facilityType ?? ''}
                onChange={(e) => setFacilityType(e.target.value as FacilityType)}
              >
                {availableFacilityTypes.map((type) => (
                  <Select.Option key={type}>{type}</Select.Option>
                ))}
              </Select>
            </div>
          </StatisticsFilterAccordionItem>
        )}

        {!hasOneFacility && (
          <StatisticsFilterAccordionItem
            label={t('statistics:facility')}
            subtitle={t('statistics:selection', { count: facilityIds.length, total: totalFacilities })}
          >
            <div className="flex flex-col gap-12 pl-6">
              <FacilityCombobox
                groups={groups}
                optionsKey={optionsKey}
                value={facilityIds}
                onChange={setFacilityIds}
                dataCy="facility-select-mobile"
              />
            </div>
          </StatisticsFilterAccordionItem>
        )}

        <StatisticsFilterAccordionItem label={t('statistics:showBy')} subtitle={periodSubtitle}>
          <div className="flex flex-col gap-16 pl-6">
            <ModeSelect dataCy="date-toggle-mobile" />
            {mode === 'year' && <StatisticsFilterYear />}
            {mode === 'month' && <StatisticsFilterMonth />}
            {mode === 'day' && <StatisticsFilterDay />}
          </div>
        </StatisticsFilterAccordionItem>

        {!isHourQuarter && (
          <StatisticsFilterAccordionItem label={t('statistics:compareYear')} subtitle={compareYearSubtitle}>
            <div className="pl-6">
              <CompareYearSelect className="w-full" dataCy="compare-year-select-mobile" />
            </div>
          </StatisticsFilterAccordionItem>
        )}
      </Accordion>

      <Button onClick={closeHandler} size="lg" className="w-full" data-cy="statistics-filter-mobile-apply">
        {t('statistics:use')}
      </Button>
    </div>
  );
};
