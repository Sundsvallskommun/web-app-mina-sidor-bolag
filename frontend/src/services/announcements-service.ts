import { Announcement } from '@interfaces/announcements';
import { useApi } from './api-service';

interface AnnouncementsResponse {
  announcements: Announcement[];
}

export const mapAnnouncementsResponse = (data: AnnouncementsResponse) => {
  return data;
};

export const useAnnouncements = () => {
  return useApi<AnnouncementsResponse, Error, AnnouncementsResponse>({
    method: 'get',
    url: '/announcements',
    dataHandler: mapAnnouncementsResponse,
    queryKey: ['announcements'],
  });
};
