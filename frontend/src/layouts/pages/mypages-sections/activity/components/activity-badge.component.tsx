import { Label } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { ActivityType } from '../activity.types';

type LabelColor = React.ComponentProps<typeof Label>['color'];

const BADGE: Record<ActivityType, { color: LabelColor; inverted: boolean }> = {
  login: { color: 'tertiary', inverted: true },
  impersonation: { color: 'tertiary', inverted: false },
  hanActivated: { color: 'gronsta', inverted: true },
  hanDeactivated: { color: 'error', inverted: true },
};

export const ActivityBadge = ({ activityType }: { activityType: ActivityType }) => {
  const { t } = useTranslation('activity');
  const { color, inverted } = BADGE[activityType];

  return (
    <Label
      rounded
      color={color}
      inverted={inverted}
      className="whitespace-nowrap"
      data-cy={`activity-badge-${activityType}`}
    >
      {t(`activity:badge.${activityType}`)}
    </Label>
  );
};
