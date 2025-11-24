import { translateAggregateOn, translateCategory } from '@utils/facility';
import dayjs from 'dayjs';
import { PagedEvents } from '@data-contracts/backend/data-contracts';
import { EventData, MetaDataFacility, StructuredMetaData } from '@interfaces/event';

const mapData = (data: Array<{ key: string; value: string }>, startObj = {}) => {
  return data.reduce((object, item) => {
    return { ...object, [item.key]: item.value };
  }, startObj);
};

const getFacilities = (data: Array<{ key: string; value: string }>) => {
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

export const handleEventLogResponse: (data: PagedEvents) => EventData = (data): EventData => {
  data.content.forEach((event) => {
    const mappedData: StructuredMetaData = mapData(
      event.metadata.filter((item) => !item.key.startsWith('facilities[')),
      { facilities: getFacilities(event.metadata) }
    ) as StructuredMetaData;

    mappedData.facilities.forEach((facility: MetaDataFacility) => {
      facility.category = translateCategory(facility.category);
      facility.aggregateOn = translateAggregateOn(facility.aggregateOn);
      facility.toDate = dayjs(facility.toDate).format('YYYY-MM-DD');
      facility.fromDate = dayjs(facility.fromDate).format('YYYY-MM-DD');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event.metadata = mappedData as any;
  });

  return data as unknown as EventData;
};

export const eventLogHandler = (data: PagedEvents) => handleEventLogResponse(data);
