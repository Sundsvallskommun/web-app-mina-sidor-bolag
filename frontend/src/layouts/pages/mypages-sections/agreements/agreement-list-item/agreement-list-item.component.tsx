'use client';

import { Label, Button } from '@sk-web-gui/react';
import { ChevronRight } from 'lucide-react';
import { PaddedListIcon } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/padded-list-icon/padded-list-icon.component';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

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
  const searchParams = useSearchParams();
  const { t } = useTranslation(['common', 'agreement']);

  const handleClick = () => {
    const query = searchParams.toString();
    router.push(query ? `./avtal/${agreementSlug}?${query}` : `./avtal/${agreementSlug}`);
  };

  return (
    <div
      onClick={() => handleClick()}
      className="flex mb-16 bg-background-content shadow-50 py-16 px-20 rounded-cards justify-between hover:bg-background-200 hover:cursor-pointer"
      data-cy={`agreement-${facilityId}-${description}`}
    >
      <div className="flex lg:items-center justify-between">
        <PaddedListIcon color={category.color} iconName={category.icon} />

        <div>
          <p className="md:text-large font-bold">
            {t('agreement:item.title', {
              label: category.label,
              production: production ? t('agreement:item.production') : null,
            })}
          </p>

          {!active ? (
            <Label className="md:hidden visible my-10 md:mr-64 mr-16" color="error" inverted rounded>
              {t('agreement:item.inactive')}
            </Label>
          ) : null}

          <div className="lg:flex items-center text-small">
            <strong className="pr-6">{t('agreement:item.facilityId')}</strong>
            <p className="lg:pb-0 pb-16 pr-24">{facilityId}</p>
            <strong className="pr-6">{t('agreement:item.netArea')}</strong>
            <p className="lg:pb-0 pb-16 pr-24">{area}</p>
            <strong className="pr-6">{t('agreement:item.type')}</strong> <p className="pr-24">{description}</p>
          </div>
        </div>
      </div>

      <div className="md:flex block md:items-center md:mt-0 mt-8">
        {!active ? (
          <Label className="mr-64 md:flex hidden" color="error" inverted rounded>
            {t('agreement:item.inactive')}
          </Label>
        ) : null}

        <Button size="lg" variant="tertiary" iconButton rightIcon={<ChevronRight />} showBackground={false} />
      </div>
    </div>
  );
};
