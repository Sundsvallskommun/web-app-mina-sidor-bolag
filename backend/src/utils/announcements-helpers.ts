import { AnnouncementGroup } from '@/interfaces/announcements.interface';
import { XMLParser } from 'fast-xml-parser';

export interface RssFeed {
  '?xml': {
    '@version': string;
    '@encoding': string;
  };
  rss: {
    '@version': string;
    channel: RssChannel;
  };
}

interface RssChannel {
  title: string;
  link: string;
  description: string;
  language: string;
  copyright: string;
  generator: string;
  item: RssItem[];
}

interface RawRssItem {
  title: string;
  description: string;
  content: string;
  enclosure?: Enclosure;
  pubDate: string;
  link: string;
  channel: string;
  category: string;
  guid: string;
}

type Enclosure = {
  '@url': string;
  '@length': string;
  '@type': string;
};

export type RssItem = Omit<RawRssItem, 'enclosure'> & {
  imageUrl?: string;
  imageLength?: number;
  imageType?: string;
};

export enum RSSCategory {
  EL_TRADE = 'Elhandel',
  EL = 'Elnät',
  DISTRICT_HEATING = 'Fjärrvärme',
}

export const mapRssItem = ({ enclosure, ...rest }: RawRssItem): RssItem => ({
  ...rest,
  imageUrl: enclosure?.['@url'],
  imageLength: enclosure ? Number(enclosure['@length']) : undefined,
  imageType: enclosure?.['@type'],
});

export const getRssItems = (feed: RssFeed): RssItem[] => (feed.rss?.channel?.item ?? []).map(mapRssItem);

const CATEGORY_TO_GROUPS: Record<RSSCategory, AnnouncementGroup[]> = {
  [RSSCategory.EL]: [AnnouncementGroup.CUSTOMER_SV_EL],
  [RSSCategory.EL_TRADE]: [AnnouncementGroup.CUSTOMER_SV_EL],
  [RSSCategory.DISTRICT_HEATING]: [AnnouncementGroup.CUSTOMER_SV_ENERGI],
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  isArray: (_name, jpath) => jpath === 'rss.channel.item',
});

export const announcementsRSSfeed = (xml: string) => parser.parse(xml) as RssFeed;

const isRssCategory = (v: string): v is RSSCategory => (Object.values(RSSCategory) as string[]).includes(v);

export const parseGroups = (category: string | undefined): AnnouncementGroup[] => {
  const groups = (category ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(isRssCategory)
    .flatMap(c => CATEGORY_TO_GROUPS[c]);

  return [...new Set(groups)];
};
