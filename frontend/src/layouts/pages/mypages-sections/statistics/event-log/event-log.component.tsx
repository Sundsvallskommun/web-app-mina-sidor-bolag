'use client';

import { useTranslation } from 'react-i18next';
import { useApi } from '@services/api-service';
import { Button, Spinner } from '@sk-web-gui/react';
import { EventItem } from '@layouts/pages/mypages-sections/statistics/event-log/event-item.component';
import { eventLogHandler } from '@services/event-log-service';
import { useEffect, useState } from 'react';
import { EventData, StructuredEvent } from '@interfaces/event';

export const EventLog = () => {
  const { t } = useTranslation(['event', 'invoice']);
  const [eventData, setEventData] = useState<EventData>();
  const [pageSize, setPageSize] = useState<number>(4);

  const searchParams = new URLSearchParams({});
  searchParams.append('size', pageSize.toString());
  searchParams.append('sort', 'created,desc');

  const { data, isFetching, isFetched, refetch } = useApi({
    method: 'get',
    url: `/event/get?${searchParams}`,
    dataHandler: eventLogHandler,
    queryKey: ['events'],
  });

  useEffect(() => {
    setEventData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  return (
    <div className="mt-40">
      <p>{t('event:description')}</p>

      {isFetched ? (
        <>
          {eventData?.content?.length ? (
            <div>
              <div className="flex flex-col mt-20 gap-32">
                {eventData.content?.map((event: StructuredEvent) => {
                  return <EventItem data={event} key={event.created} />;
                })}
              </div>

              {eventData.totalElements ? (
                <div className="flex flex-col mx-auto mt-8">
                  <span className="text-small text-center text-secondary mt-lg" data-cy="page-count">
                    {t('invoice:showing', {
                      count: Math.min(pageSize, eventData.totalElements),
                      total: eventData.totalElements,
                    })}
                  </span>
                  {eventData.totalElements > pageSize ? (
                    <Button
                      className="m-auto mt-12"
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        setPageSize(pageSize + 4);
                      }}
                      loading={isFetching}
                      data-cy="show-more-events-button"
                    >
                      {t('invoice:showMore')}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-20">{t('event:noLoggedExports')}</p>
          )}
        </>
      ) : (
        <Spinner className="mx-auto my-40" />
      )}
    </div>
  );
};
