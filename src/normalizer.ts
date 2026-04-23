import * as cheerio from 'cheerio';
import type { EventItem, VenueInfo } from './types';
import { parseDate, stripHtml, buildLocation } from './utils/normalize';

interface EventbriteJsonLd {
  '@type': string;
  name?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: {
    name?: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressCountry?: string;
    };
    geo?: { latitude?: number; longitude?: number };
  };
  image?: string | string[];
  organizer?: { name?: string };
  offers?: { price?: string; priceCurrency?: string };
  eventAttendanceMode?: string;
}

export function normalizeEntry(ev: EventbriteJsonLd, scrapedAt: string): EventItem | null {
  if (!ev.name || !ev.url || !ev.startDate) return null;
  const city = ev.location?.address?.addressLocality;
  const country = ev.location?.address?.addressCountry;
  const venue: VenueInfo = {
    name: ev.location?.name,
    address: ev.location?.address?.streetAddress,
    city,
    country,
    lat: ev.location?.geo?.latitude,
    lng: ev.location?.geo?.longitude,
  };
  const isOnline = ev.eventAttendanceMode?.includes('OnlineEventAttendanceMode') ?? false;
  const priceStr = ev.offers?.price;
  const isFree = !priceStr || priceStr === '0' || priceStr.toLowerCase() === 'free';
  const image = Array.isArray(ev.image) ? ev.image[0] : ev.image;
  const desc = stripHtml(ev.description ?? '');

  return {
    name: ev.name,
    url: ev.url,
    startAt: parseDate(ev.startDate),
    endDate: ev.endDate ? parseDate(ev.endDate) : undefined,
    description: desc,
    location: buildLocation(city, country),
    venue,
    isOnline,
    isFree,
    ticketPrice: isFree ? 'Free' : priceStr ? `${priceStr} ${ev.offers?.priceCurrency ?? ''}`.trim() : undefined,
    ticketUrl: ev.url,
    imageUrl: image,
    organizer: ev.organizer?.name,
    source: 'eventbrite',
    scrapedAt,
  };
}

export function parseSearchPage(html: string, maxResults: number, scrapedAt: string): EventItem[] {
  const $ = cheerio.load(html);
  const items: EventItem[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    if (items.length >= maxResults) return false;
    try {
      const raw = JSON.parse($(el).html() ?? '{}') as Record<string, unknown>;
      if (raw['@type'] === 'ItemList') {
        for (const listItem of (raw.itemListElement as Array<{ item?: EventbriteJsonLd; url?: string }>) ?? []) {
          if (items.length >= maxResults) break;
          const ev = listItem.item ?? (listItem as unknown as EventbriteJsonLd);
          if (!ev || ev['@type'] !== 'Event') continue;
          const item = normalizeEntry(ev, scrapedAt);
          if (item) items.push(item);
        }
      } else if (raw['@type'] === 'Event') {
        const item = normalizeEntry(raw as unknown as EventbriteJsonLd, scrapedAt);
        if (item && items.length < maxResults) items.push(item);
      }
    } catch {
      // malformed JSON-LD
    }
  });

  return items;
}
