'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { StatisticsFilter } from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.component';
import { Faq } from '@layouts/pages/mypages-sections/statistics/faq/faq.component';
import Charts from '@layouts/pages/mypages-sections/statistics/charts/charts.component';
import React, { useState } from 'react';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { Button, Modal, Spinner } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

export interface StatisticsForm {
  category: string;
  facilityId?: string;
  address: string;
  fromDate: string;
  toDate: string;
  /** four digit string */
  selectedYear?: string;
  /** two digit string */
  selectedMonth?: string;
  /** two digit string */
  selectedDay?: string;
  year?: string;
}

export default function Statistics() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t } = useTranslation('statistics');

  const context = useForm<StatisticsForm>({
    mode: 'onChange',
    defaultValues: {
      category: '',
    },
  });

  const { isFetching } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <FormProvider {...context}>
        <div className="md:flex md:justify-between">
          <h1 className="mb-40">{t('statistics:title')}</h1>
          <Button className="sm:hidden block" onClick={openHandler}>
            {t('statistics:filter')}
          </Button>
        </div>

        <form>
          {isFetching ? (
            <Spinner className="mx-auto" />
          ) : (
            <>
              <div className="sm:block hidden">
                <StatisticsFilter closeHandler={closeHandler} />
              </div>

              <Charts />
            </>
          )}
        </form>

        <Modal
          className="sm:hidden block w-full left-0 bottom-0 fixed rounded-0 rounded-t-cards"
          disableCloseOutside={true}
          show={isOpen}
          onClose={closeHandler}
          label="Filtrera"
        >
          <Modal.Content>
            <StatisticsFilter closeHandler={closeHandler} />
          </Modal.Content>
        </Modal>
      </FormProvider>

      <Faq />
    </div>
  );
}
