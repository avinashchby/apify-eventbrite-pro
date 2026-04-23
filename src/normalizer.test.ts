import { describe, it, expect } from 'vitest';
import { parseSearchPage } from './normalizer';

const ITEM_LIST_HTML = `
<html><head>
<script type="application/ld+json">
{
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "item": {
        "@type": "Event",
        "name": "Test Conference 2026",
        "url": "https://www.eventbrite.com/e/test-123",
        "startDate": "2026-06-15T18:00:00Z",
        "endDate": "2026-06-15T21:00:00Z",
        "description": "A great conference about technology",
        "location": {
          "name": "Convention Center",
          "address": { "addressLocality": "San Francisco", "addressCountry": "US" }
        },
        "organizer": { "name": "TechConf Inc" },
        "offers": { "price": "99", "priceCurrency": "USD" }
      }
    }
  ]
}
</script>
</head><body></body></html>
`;

describe('parseSearchPage', () => {
  it('extracts events from ItemList JSON-LD', () => {
    const scrapedAt = new Date().toISOString();
    const events = parseSearchPage(ITEM_LIST_HTML, 50, scrapedAt);

    expect(events).toHaveLength(1);
    const ev = events[0];
    expect(ev.name).toBe('Test Conference 2026');
    expect(ev.url).toBe('https://www.eventbrite.com/e/test-123');
    expect(ev.location).toBe('San Francisco, US');
    expect(ev.isFree).toBe(false);
    expect(ev.ticketPrice).toBe('99 USD');
    expect(ev.organizer).toBe('TechConf Inc');
    expect(ev.source).toBe('eventbrite');
  });

  it('respects maxResults limit', () => {
    const scrapedAt = new Date().toISOString();
    const events = parseSearchPage(ITEM_LIST_HTML, 0, scrapedAt);
    expect(events).toHaveLength(0);
  });

  it('returns empty array for HTML with no JSON-LD', () => {
    const events = parseSearchPage('<html><body>No events here</body></html>', 50, new Date().toISOString());
    expect(events).toHaveLength(0);
  });
});
