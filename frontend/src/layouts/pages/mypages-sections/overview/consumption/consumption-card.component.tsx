'use client';

import { Icon } from '@sk-web-gui/react';
import { ArrowDownRightIcon, Circle, Home } from 'lucide-react';

export const ConsumptionCard = (props) => {
  const { data } = props;

  return (
    <article className="bg-background-content shadow-50 rounded-2xl p-16 lg:my-0 mb-24">
      <div className="flex gap-12 pb-32">
        <div className="flex items-center">
          <Icon icon={<Home />} />
        </div>
        <p className="text-large">{data.type}</p>
      </div>

      <div className="flex gap-16">
        <div>
          <Icon icon={<Circle />} size={50} />
        </div>
        <div>
          <h4 className="flex items-center text-h4-lg text-gronsta-text">
            <Icon icon={<ArrowDownRightIcon />} />
            {data.consumption}
          </h4>
          <p className="text-small">{data.difference}</p>
        </div>
      </div>
    </article>
  );
};
