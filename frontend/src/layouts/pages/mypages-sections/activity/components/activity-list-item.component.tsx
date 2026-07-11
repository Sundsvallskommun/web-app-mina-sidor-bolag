'use client';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../activity.types';
import { ActivityBadge } from './activity-badge.component';

interface ActivityListItemProps {
  item: ActivityItem;
}

export const ActivityListItem = ({ item }: ActivityListItemProps) => {
  const { t } = useTranslation('activity');

  const renderDetails = () => {
    switch (item.type) {
      case 'login':
        return item.organizationName ? (
          <p className="m-0">
            <strong>{t('activity:item.company')}:</strong> {item.organizationName}
          </p>
        ) : null;
      case 'impersonation':
        return item.supportReason ? (
          <p className="m-0">
            <strong>{t('activity:item.supportReason')}:</strong> {item.supportReason}
          </p>
        ) : null;
      case 'hanActivated':
      case 'hanDeactivated':
        return (
          <div className="flex flex-col gap-4 md:flex-row md:gap-0">
            {item.address && (
              <p className="m-0">
                <strong>{t('activity:item.address')}:</strong> {item.address}
              </p>
            )}
            {item.facilityId && (
              <p className="m-0">
                {item.address && <span className="hidden md:inline">, </span>}
                <strong>{t('activity:item.facilityId')}:</strong> {item.facilityId}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div
      data-cy="activity-list-item"
      className="flex flex-col-reverse gap-8 rounded-cards bg-background-color-mixin-1 p-16 md:flex-row md:items-center md:justify-between md:gap-16"
    >
      <div className="flex flex-col gap-4 text-dark-secondary">
        <p className="m-0 text-dark-primary">
          <strong>{item.name}</strong>
          {item.personNumber ? `, ${item.personNumber}` : ''}
        </p>
        {renderDetails()}
        <p className="m-0">
          <strong>{t('activity:item.timestamp')}:</strong>{' '}
          {dayjs(item.timestamp).format('DD MMMM YYYY, kl. HH.mm').toLowerCase()}
        </p>
      </div>
      <div className="md:shrink-0">
        <ActivityBadge activityType={item.type} />
      </div>
    </div>
  );
};
