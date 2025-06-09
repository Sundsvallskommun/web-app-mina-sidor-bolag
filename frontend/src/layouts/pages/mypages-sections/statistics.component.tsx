'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { StatisticsFilter } from '@layouts/pages/mypages-sections/statistics/statistics-filter/statistics-filter.component';
import { ExportStatisticsButton } from '@layouts/pages/mypages-sections/statistics/export-statistics-button/export-statistics-button.component';
import { Faq } from '@layouts/pages/mypages-sections/statistics/faq/faq.component';
import Charts from '@layouts/pages/mypages-sections/statistics/charts/charts.component';
import React from 'react';

export default function Statistics() {
  const context = useForm({
    mode: 'onChange',
  });

  return (
    <div>
      <FormProvider {...context}>
        <div className="md:flex md:justify-between">
          <h1 className="mb-56">Din statistik</h1>
          <ExportStatisticsButton />
        </div>

        <form onChange={() => console.log('onChange ', context.getValues())}>
          <StatisticsFilter />
          <Charts />
        </form>
      </FormProvider>

      <Faq />
    </div>
  );
}
