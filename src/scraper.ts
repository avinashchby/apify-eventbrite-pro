import { chromium } from 'playwright';
import type { InputSchema, EventItem } from './types';
import { parseSearchPage } from './normalizer';

export class EventbriteScraper {
  private input: InputSchema;

  constructor(input: InputSchema) {
    this.input = input;
  }

  async scrape(): Promise<EventItem[]> {
    const browser = await chromium.launch({ headless: true });
    const allEvents: EventItem[] = [];
    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      });

      for (let page = 1; page <= this.input.maxPages && allEvents.length < this.input.maxResults; page++) {
        const url = this.buildUrl(page);
        console.log(`[eventbrite] scraping page ${page}: ${url}`);

        const browserPage = await context.newPage();
        try {
          await new Promise(r => setTimeout(r, 500 + Math.random() * 1500));
          await browserPage.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
          const html = await browserPage.content();
          const title = await browserPage.title();
          console.log(`[eventbrite] page ${page} title="${title}" html=${html.length} bytes`);

          const scrapedAt = new Date().toISOString();
          const events = parseSearchPage(html, this.input.maxResults - allEvents.length, scrapedAt);
          console.log(`[eventbrite] page ${page}: found ${events.length} events`);

          if (events.length === 0) {
            console.log(`[eventbrite] no events on page ${page}, stopping pagination`);
            break;
          }

          allEvents.push(...events);
        } finally {
          await browserPage.close();
        }
      }
    } finally {
      await browser.close();
    }

    return this.applyFilters(allEvents);
  }

  private buildUrl(page: number): string {
    const { city, country, query, dateFrom, dateTo, category } = this.input;
    const place = city && country
      ? `${country.toLowerCase()}--${city.toLowerCase().replace(/\s+/g, '-')}`
      : city ? `us--${city.toLowerCase().replace(/\s+/g, '-')}` : 'online';
    const keyword = category
      ? category.toLowerCase().replace(/\s+/g, '-')
      : query ? query.toLowerCase().replace(/\s+/g, '-') : 'events';

    const params = new URLSearchParams();
    if (query && category) params.set('q', query);
    if (dateFrom) params.set('start_date', dateFrom);
    if (dateTo) params.set('end_date', dateTo);
    if (this.input.priceType === 'free') params.set('is_free', '1');
    if (page > 1) params.set('page', String(page));

    const qs = params.toString();
    return `https://www.eventbrite.com/d/${place}/${keyword}/${qs ? '?' + qs : ''}`;
  }

  private applyFilters(events: EventItem[]): EventItem[] {
    return events.filter(ev => {
      if (this.input.priceType === 'free' && !ev.isFree) return false;
      if (this.input.priceType === 'paid' && ev.isFree) return false;
      if (this.input.dateFrom && ev.startAt < this.input.dateFrom) return false;
      if (this.input.dateTo && ev.startAt > this.input.dateTo + 'T23:59:59Z') return false;
      return true;
    }).slice(0, this.input.maxResults);
  }
}
