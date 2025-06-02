import React from 'react';
import ElectricityConsumption from '@layouts/pages/mypages-sections/statistics/charts/electricity-consumption/electricity-consumption.component';
import { Divider } from '@sk-web-gui/react';
import OutdoorTemperature from '@layouts/pages/mypages-sections/statistics/charts/outdoor-temperature/outdoor-temperature.component';

export default function Charts() {
  return (
    <div className="bg-background-content rounded-cards shadow-50 mt-40 py-40 lg:px-32 px-20">
      <ElectricityConsumption />
      <Divider className="my-40" />
      <OutdoorTemperature />
    </div>
  );
}
