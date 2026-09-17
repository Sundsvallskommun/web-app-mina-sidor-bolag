import { RSS_FEED_PASSWORD, RSS_FEED_URL, RSS_FEED_USERNAME } from '@/config';
import { Announcement, AnnouncementResponse } from '@/interfaces/announcements.interface';
import { ApiResponse } from '@/services/api.service';
import { logger } from '@/utils/logger';
import { announcementsRSSfeed, getRssItems, parseGroups, RssFeed } from '@/utils/announcements-helpers';
import axios, { isAxiosError } from 'axios';
import { Controller, Get, HttpError } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class AnnouncementsController {
  @Get('/announcements')
  @OpenAPI({ summary: 'Return announcements from Bolagens RSS feed' })
  async getAnnouncements(): Promise<ApiResponse<AnnouncementResponse>> {
    let feed: RssFeed;

    try {
      const res = await axios.get<string>(RSS_FEED_URL!, {
        ...(RSS_FEED_USERNAME &&
          RSS_FEED_PASSWORD && {
            auth: { username: RSS_FEED_USERNAME, password: RSS_FEED_PASSWORD },
          }),
        timeout: 5000,
      });
      feed = announcementsRSSfeed(res.data);
    } catch (error) {
      if (isAxiosError(error)) {
        logger.error(`RSS feed request failed: ${error.response?.status ?? error.code} ${error.message}`);
        throw new HttpError(502, 'Could not fetch announcements');
      }
      logger.error('Failed to parse RSS feed', error);
      throw new HttpError(500, 'Could not parse announcements');
    }

    const items = getRssItems(feed);

    const announcements: Announcement[] = items.map((item, i) => ({
      id: i + 1,
      title: item.title,
      text: item.description,
      urlTitle: 'readMore',
      url: item.link,
      image: item.imageUrl ?? '',
      groups: parseGroups(item.category),
    }));

    return {
      data: { announcements },
      message: 'success',
    };
  }
}
