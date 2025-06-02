import React from 'react';
import ConsumptionInformation from '@layouts/pages/mypages-sections/statistics/charts/electricity-consumption/consumption-information.component';

export default function ElectricityConsumption({}) {
  return (
    <div>
      <h4>Elförbrukning</h4>
      <p>Adress</p>

      <ConsumptionInformation />
    </div>
  );
}
