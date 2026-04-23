import { Actor } from 'apify';
import type { InputSchema } from './types';
import { EventbriteScraper } from './scraper';

async function main(): Promise<void> {
  await Actor.init();
  try {
    const rawInput = await Actor.getInput<Partial<InputSchema>>();
    const input: InputSchema = {
      query: rawInput?.query,
      city: rawInput?.city,
      country: rawInput?.country ?? 'us',
      dateFrom: rawInput?.dateFrom,
      dateTo: rawInput?.dateTo,
      category: rawInput?.category,
      priceType: rawInput?.priceType ?? 'both',
      maxPages: rawInput?.maxPages ?? 5,
      maxResults: rawInput?.maxResults ?? 100,
    };

    console.log(`[eventbrite-pro] Starting: query="${input.query}" city="${input.city}" pages=${input.maxPages}`);
    const scraper = new EventbriteScraper(input);
    const events = await scraper.scrape();

    console.log(`[eventbrite-pro] Done. Total events: ${events.length}`);
    if (events.length === 0) {
      console.warn('[eventbrite-pro] No events found. Try different keywords or location.');
    }

    const dataset = await Actor.openDataset();
    await dataset.pushData(events);

    await Actor.exit();
  } catch (err) {
    console.error('[eventbrite-pro] Fatal error:', err);
    await Actor.exit({ exitCode: 1 });
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
