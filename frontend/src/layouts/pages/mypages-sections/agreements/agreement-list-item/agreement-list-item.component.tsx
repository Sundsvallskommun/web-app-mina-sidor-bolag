'use client';

import { Button, Icon, Link } from '@sk-web-gui/react';
import { ChevronRight, UtilityPole } from 'lucide-react';

interface AgreementListItemProps {
  agreementSlug: string;
  agreementType: string;
  facilityId: string;
  area: string;
  type: string;
}

export const AgreementListItem = (props: AgreementListItemProps) => {
  const { agreementSlug, agreementType, facilityId, area, type } = props;

  return (
    <div className="flex mb-16 bg-background-content shadow-50 py-16 px-20 rounded-cards justify-between">
      <div className="flex lg:items-center justify-between">
        <div className="bg-warning-background-200 flex justify-center items-center w-52 h-52 rounded-button mr-16">
          <Icon icon={<UtilityPole />} size={30} />
        </div>

        <div>
          <p className="text-large font-bold">{agreementType}</p>

          <div className="lg:flex items-center text-small">
            <strong className="pr-6">Anläggnings-ID</strong> <p className="lg:pb-0 pb-16 pr-24">{facilityId}</p>
            <strong className="pr-6">Nätområde</strong> <p className="lg:pb-0 pb-16 pr-24">{area}</p>
            <strong className="pr-6">Typ</strong> <p className="pr-24">{type}</p>
          </div>
        </div>
      </div>

      <Link className="flex lg:items-center" href={`./avtal/${agreementSlug}`}>
        <Button
          iconButton
          variant="tertiary"
          size="lg"
          showBackground={false}
          rightIcon={<Icon icon={<ChevronRight />} />}
        />
      </Link>
    </div>
  );
};
