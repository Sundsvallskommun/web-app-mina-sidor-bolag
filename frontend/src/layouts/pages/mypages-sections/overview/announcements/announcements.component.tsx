'use client';

import { RepresentingEntity } from '@data-contracts/backend/data-contracts';
import { AnnouncementGroup } from '@interfaces/announcements';
import { RepresentingMode } from '@interfaces/app';
import { useAnnouncements } from '@services/announcements-service';
import { useApi } from '@services/api-service';
import { Image, Link, Spinner } from '@sk-web-gui/react';
import { getCustomerGroups } from '@utils/app-organizations';
import { useRelations } from '@utils/use-relations.hook';
import { useTranslation } from 'react-i18next';

const getRepresentingGroup = (representingEntity?: RepresentingEntity): AnnouncementGroup => {
  switch (representingEntity?.mode) {
    case RepresentingMode.BUSINESS:
      return AnnouncementGroup.BUSINESS;

    default:
    case RepresentingMode.PRIVATE:
      return AnnouncementGroup.PRIVATE;
  }
};

export const Announcements = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });
  const { relations, activeCustomerEngagements } = useRelations();
  const { t } = useTranslation('overview');
  const { data, isFetching, isLoading, error, isSuccess } = useAnnouncements();
  const groups = [getRepresentingGroup(representingEntity), ...getCustomerGroups(activeCustomerEngagements)];

  if (isFetching && isLoading && !representingEntity && !relations) {
    return;
  }

  const announcements = data?.announcements.filter((announcement) =>
    groups.some((group) => announcement.groups.includes(group))
  );

  const content = isSuccess ? (
    <>
      {announcements?.map((announcement, index) => {
        return (
          <div
            key={`anouncement-${index}`}
            className="bg-background-content shadow-50 rounded-cards max-w-[106rem] flex flex-col sm:flex-row sm:min-w-[36rem]"
          >
            <div className="shrink-0 sm:w-1/4">
              <Image
                src={announcement.image ? announcement.image : '/default-feed-image.png'}
                alt={announcement.imageAlt}
                className="rounded-t-cards sm:rounded-r-0 sm:rounded-l-cards object-cover object-center w-full h-auto max-h-[38rem] sm:max-h-[48rem] sm:min-h-full"
              />
            </div>
            <div className="p-24 flex flex-col gap-16">
              <h2 className="text-h3-md">{announcement.title}</h2>
              <p>{announcement.text}</p>
              {announcement.url && (
                <Link external className="font-bold text-dark underline" href={announcement.url}>
                  {t(`overview:announcements.${announcement.urlTitle}`)}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </>
  ) : (
    <div className="flex justify-center w-full">
      <Spinner />
    </div>
  );

  return (
    <section className="pt-80">
      <h3>{t('overview:announcements.title')}</h3>
      <div className="flex flex-col gap-24 my-24">{error ? <p>{t('overview:announcements.error')}</p> : content}</div>
    </section>
  );
};
