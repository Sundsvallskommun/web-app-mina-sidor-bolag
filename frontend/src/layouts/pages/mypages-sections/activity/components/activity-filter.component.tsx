'use client';

import { Button, DatePicker, FormLabel, Icon, Modal, RadioButton } from '@sk-web-gui/react';
import dayjs from 'dayjs';
import { ListFilter } from 'lucide-react';
import { ChangeEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LOOKBACK_MONTHS = 36;

const ACTIVITY_TYPE_FILTERS = ['all', 'login', 'han'] as const;
export type ActivityTypeFilter = (typeof ACTIVITY_TYPE_FILTERS)[number];

export interface ActivityFilterValue {
  activityTypeFilter: ActivityTypeFilter;
  from: string;
  to: string;
}

export const DEFAULT_ACTIVITY_FILTER: ActivityFilterValue = {
  activityTypeFilter: 'all',
  from: '',
  to: '',
};

interface ActivityFilterProps {
  value: ActivityFilterValue;
  onChange: (value: ActivityFilterValue) => void;
}

const MIN_DATE = dayjs().subtract(LOOKBACK_MONTHS, 'month').format('YYYY-MM-DD');
const MAX_DATE = dayjs().format('YYYY-MM-DD');

const FilterFields = ({ value, onChange }: ActivityFilterProps): ReactElement => {
  const { t } = useTranslation('activity');

  return (
    <>
      <fieldset className="flex flex-col gap-12">
        <FormLabel className="text-label-large">{t('activity:filter.show')}</FormLabel>
        <RadioButton.Group className="gap-8 sm:!flex-row sm:gap-16" size="lg" value={value.activityTypeFilter}>
          {ACTIVITY_TYPE_FILTERS.map((option) => (
            <RadioButton
              key={option}
              value={option}
              onChange={() => onChange({ ...value, activityTypeFilter: option })}
              data-cy={`activity-filter-${option}`}
            >
              {t(`activity:filter.${option}`)}
            </RadioButton>
          ))}
        </RadioButton.Group>
      </fieldset>

      <div className="flex flex-col gap-8">
        <FormLabel className="text-label-large sm:hidden">{t('activity:filter.period')}</FormLabel>
        <div className="flex gap-16">
          <div className="flex flex-1 flex-col gap-8">
            <FormLabel>{t('activity:filter.from')}</FormLabel>
            <DatePicker
              type="date"
              className="w-full"
              value={value.from}
              min={MIN_DATE}
              max={value.to || MAX_DATE}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...value, from: e.target.value })}
              data-cy="activity-filter-from"
            />
          </div>
          <div className="flex flex-1 flex-col gap-8">
            <FormLabel>{t('activity:filter.to')}</FormLabel>
            <DatePicker
              type="date"
              className="w-full"
              value={value.to}
              min={value.from || MIN_DATE}
              max={MAX_DATE}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...value, to: e.target.value })}
              data-cy="activity-filter-to"
            />
          </div>
        </div>
      </div>
    </>
  );
};

const DesktopFilterBar = ({ value, onChange }: ActivityFilterProps): ReactElement => (
  <div className="hidden sm:flex sm:items-end sm:justify-between sm:gap-24 h-[86px]">
    <FilterFields value={value} onChange={onChange} />
  </div>
);

const MobileFilterOverlay = ({ value, onChange }: ActivityFilterProps): ReactElement => {
  const { t } = useTranslation('activity');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const openModal = () => {
    setDraft(value);
    setOpen(true);
  };

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      <Button
        color="primary"
        size="md"
        className="sm:hidden"
        leftIcon={<Icon icon={<ListFilter />} />}
        onClick={openModal}
        data-cy="activity-filter-open"
      >
        {t('activity:filter.filter')}
      </Button>

      <Modal
        show={open}
        onClose={() => setOpen(false)}
        label={t('activity:filter.title')}
        labelAs="h2"
        className="sm:hidden"
        data-cy="activity-filter-modal"
      >
        <Modal.Content className="flex flex-col gap-32 p-0 pb-16">
          <FilterFields value={draft} onChange={setDraft} />
        </Modal.Content>
        <Modal.Footer className="flex flex-row gap-16 pt-16">
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={() => setOpen(false)}
            data-cy="activity-filter-cancel"
          >
            {t('activity:filter.cancel')}
          </Button>
          <Button size="lg" variant="primary" className="flex-1" onClick={apply} data-cy="activity-filter-apply">
            {t('activity:filter.apply')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const ActivityFilter = (props: ActivityFilterProps): ReactElement => (
  <div data-cy="activity-filter">
    <DesktopFilterBar {...props} />
    <MobileFilterOverlay {...props} />
  </div>
);
