'use client';

import { Disturbance } from '@data-contracts/backend/data-contracts';
import { Disclosure, Divider, Icon, Label } from '@sk-web-gui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface DisturbanceListItemProps {
  disturbance: Disturbance;
}

export const DisturbanceListItem = ({ disturbance }: DisturbanceListItemProps) => {
  const { t } = useTranslation();

  const renderLabel = (status: Disturbance['status']) => {
    const color = {
      OPEN: 'error',
      PLANNED: 'vattjom',
      CLOSED: 'gronsta',
    } as const;

    return (
      <Label className="text-small sm:m-0 mt-8" color={color[status]} inverted rounded>
        {t(`disturbances:${status.toLowerCase()}`)}
      </Label>
    );
  };

  const renderEndDetails = (status: string) => {
    const isClosed = status === 'CLOSED';
    const endLabel = isClosed ? t('disturbances:endedAt') : t('disturbances:plannedEnd');
    const endDate = isClosed && disturbance.updated ? disturbance.updated : disturbance.plannedStopDate;

    return (
      <div className="text-base font-normal m-0 text-secondary sm:flex block">
        <p className="pr-4">{endLabel}</p>
        <p>{endDate ? dayjs(endDate).format('DD MMMM YYYY, kl HH.mm').toLowerCase() : t('disturbances:unknown')}</p>
      </div>
    );
  };

  return (
    <Disclosure
      key={disturbance.id}
      data-cy={`disturbance-list-item-${disturbance.id}`}
      className="bg-background-content px-24 py-8 rounded-button shadow-50"
      size="lg"
    >
      <Disclosure.Header>
        <Disclosure.Title className="sm:flex sm:justify-between block gap-16">
          <div className="flex flex-col gap-8">
            <h3 className="text-large">{disturbance.title}</h3>
            <div className="text-base font-normal m-0 text-secondary sm:flex block">
              <p className="pr-4">{t('disturbances:start')}</p>
              <p>{dayjs(disturbance.plannedStartDate).format('DD MMMM YYYY, kl HH.mm').toLowerCase()}</p>
            </div>
            {renderEndDetails(disturbance.status)}
          </div>
          {renderLabel(disturbance.status)}
        </Disclosure.Title>
        <Disclosure.Button>
          {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
        </Disclosure.Button>
      </Disclosure.Header>
      <Disclosure.Content className="mb-8">
        <div className="-ml-24 -mr-68">
          <Divider className="mx-24 pt-16" />
          <div className="px-24 pt-20">
            <p>{disturbance.description}</p>
            <p className="font-bold pt-16">{t('disturbances:affectedAddresses')}</p>
            {disturbance.affecteds?.map((affected) => {
              return (
                <p key={`${disturbance.created}-${affected.facilityId}`}>
                  {affected.reference} {t('disturbances:facilityId', { facilityId: affected.facilityId })}
                </p>
              );
            })}
            <p className="text-small pt-16">
              {t('disturbances:registered', {
                registered: dayjs(disturbance.created).format('DD MMMM YYYY, kl HH.mm').toLowerCase(),
              })}
            </p>
          </div>
        </div>
      </Disclosure.Content>
    </Disclosure>
  );
};
