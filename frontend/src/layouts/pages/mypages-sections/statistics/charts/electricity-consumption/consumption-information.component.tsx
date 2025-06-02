import React from 'react';
import { Icon } from '@sk-web-gui/react';
import { BarChart, ChartNoAxesCombined, TrendingUp } from 'lucide-react';

export default function ConsumptionInformation() {
  return (
    <div>
      <div className="lg:flex lg:justify-between block pt-56">
        <div className="border-divider lg:border-b-0 border-b-1 lg:py-0 py-16">
          <div className="flex items-center">
            <Icon icon={<BarChart />} size={22} />
            <p className="text-secondary pl-8">Total förbrukning</p>
          </div>
          <h4>0 kWh</h4>
          <p>År</p>
        </div>

        <div className="flex lg:pr-40 pr-0 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
          <div className="lg:pl-40 pl-0">
            <div className="flex items-center">
              <Icon icon={<TrendingUp />} size={22} />
              <p className="text-secondary pl-8">Högsta förbrukning</p>
            </div>
            <h4>0 kWh</h4>
            <p>Månad</p>
          </div>
        </div>

        <div className="flex pr-40 border-divider lg:border-l-1 lg:border-b-0 border-l-0 border-b-1 lg:py-0 py-16">
          <div className="lg:pl-40 pl-0">
            <div className="flex items-center">
              <Icon icon={<ChartNoAxesCombined />} size={22} />
              <p className="text-secondary pl-8">Genomsnittlig förbrukning</p>
            </div>
            <h4>0 kWh</h4>
            <p>per månad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
