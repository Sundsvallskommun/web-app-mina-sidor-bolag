'use client';

import { Icon, Label } from '@sk-web-gui/react';
import { ChevronRight } from 'lucide-react';
import { PaddedListIcon } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/padded-list-icon/padded-list-icon.component';
import { useRouter } from 'next/navigation';

interface AgreementListItemProps {
  agreementSlug: string;
  category: { label: string; color: string; icon: string };
  facilityId: string;
  area: string;
  description: string;
  production: boolean | null;
  active: boolean;
}

export const AgreementListItem = (props: AgreementListItemProps) => {
  const { agreementSlug, category, facilityId, area, description, production, active } = props;
  const router = useRouter();

  const handleClick = () => {
    router.push(`./avtal/${agreementSlug}`);
  };

  return (
    <div
      onClick={() => handleClick()}
      className="flex mb-16 bg-background-content shadow-50 py-16 px-20 rounded-cards justify-between hover:bg-background-200 hover:cursor-pointer"
    >
      <div className="flex lg:items-center justify-between">
        <PaddedListIcon color={category.color} iconName={category.icon} />

        <div>
          <p className="md:text-large font-bold">
            {category.label}
            {production ? ' produktion ' : null} avtal
          </p>

          {!active ? (
            <Label className="md:hidden visible my-10 md:mr-64 mr-16" color="error" inverted rounded>
              Frånkopplad
            </Label>
          ) : null}

          <div className="lg:flex items-center text-small">
            <strong className="pr-6">Anläggnings-ID</strong> <p className="lg:pb-0 pb-16 pr-24">{facilityId}</p>
            <strong className="pr-6">Nätområde</strong> <p className="lg:pb-0 pb-16 pr-24">{area}</p>
            <strong className="pr-6">Typ</strong> <p className="pr-24">{description}</p>
          </div>
        </div>
      </div>

      <div className="md:flex block md:items-center md:mt-0 mt-8">
        {!active ? (
          <Label className="mr-64 md:flex hidden" color="error" inverted rounded>
            Frånkopplad
          </Label>
        ) : null}

        <Icon icon={<ChevronRight />} />
      </div>
    </div>
  );
};
