'use client';

import { ConsumptionCard } from '@layouts/pages/mypages-sections/overview/consumption/consumption-card.component';
import { FormControl, FormLabel, Select } from '@sk-web-gui/react';

export const mockData = [
  {
    type: 'Fjärrvärme april 2025',
    consumption: '1500kWh',
    difference: '-26% jämfört med mars 2024 (3392 kWh)',
  },
  {
    type: 'Elförbrukning april 2025',
    consumption: '500kWh',
    difference: '-26% jämfört med mars 2024 (3392 kWh)',
  },
  {
    type: 'Elproduktion april 2025',
    consumption: '500kWh',
    difference: '-26% jämfört med mars 2024 (3392 kWh)',
  },
];

export const Consumption = () => {
  return (
    <section className="pb-80 visible">
      <h1>Aktuell förbrukning</h1>

      <FormControl className="flex flex-row items-center pb-24">
        <FormLabel>Adress</FormLabel>
        <Select size="sm">
          <Select.Option>Tellusvägen 20</Select.Option>
        </Select>
      </FormControl>

      <div className="md:grid md:grid-cols-3 md:gap-24 block">
        {mockData.map((data, index) => {
          return <ConsumptionCard key={index} data={data} />;
        })}
      </div>
    </section>
  );
};
