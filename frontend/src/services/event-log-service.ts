import dayjs from 'dayjs';
import { PagedEventsResponse, MetaData } from '@data-contracts/backend/data-contracts';
import { EventData, MetaDataFacility, StructuredMetaData, StructuredEvent } from '@interfaces/event';

const mapData = (data: MetaData[], startObj = {}) => {
  return data.reduce((object, item) => {
    return { ...object, [item.key]: item.value };
  }, startObj);
};

const getFacilities = (data: MetaData[]) => {
  const indexes = data
    .map((item) => item.key.replaceAll(/\D+/g, ''))
    .filter((key, index, arr) => !!key && arr.indexOf(key) == index);

  return indexes.reduce(
    (facilities, index) => {
      return [
        ...facilities,
        mapData(
          data
            .filter((item) => item.key.includes(index))
            .map((item) => ({ key: item.key.split(`[${index}].`)[1], value: item.value }))
        ),
      ];
    },
    [] as Record<string, string>[]
  );
};

export const handleEventLogResponse = (data: PagedEventsResponse): EventData => {
  const events = data.content as StructuredEvent[];

  events.forEach((event) => {
    const eventMetadata = event.metadata as unknown as MetaData[];
    const mappedData: StructuredMetaData = mapData(
      eventMetadata.filter((item) => !item.key.startsWith('facilities[')),
      { facilities: getFacilities(eventMetadata) }
    ) as StructuredMetaData;

    mappedData.facilities.forEach((facility: MetaDataFacility) => {
      facility.toDate = dayjs(facility.toDate).format('YYYY-MM-DD');
      facility.fromDate = dayjs(facility.fromDate).format('YYYY-MM-DD');
    });

    event.metadata = mappedData;
  });

  return data as EventData;
};

export const eventLogHandler = (data: PagedEventsResponse) => handleEventLogResponse(data);
