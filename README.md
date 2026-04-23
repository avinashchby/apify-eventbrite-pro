# Eventbrite Events Scraper Pro

> **What this actor does:** Searches Eventbrite for events matching your keywords, city, date range, category, and price type — then exports all results as structured JSON. Paginates through multiple result pages. No API key needed.

## Features

- Search by keyword, city, country, date range, category, and price type
- Paginates through up to 20 pages of results (~20 events per page = up to 400 events)
- Extracts: event name, date, location, venue, organizer, ticket price, description, image URL
- Filters: free vs paid events, date range
- Output: clean JSON compatible with Airtable, Notion, Make.com, and Zapier

## Use Cases

- **Event research**: Find all AI conferences in San Francisco in Q3 2026
- **Lead generation**: Discover startup networking events and get organizer names
- **Market research**: Track which categories and cities have the most events
- **Content creation**: Build event roundup newsletters automatically
- **Competitive intelligence**: Monitor what events competitors are hosting or attending

## Input Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `query` | string | Search keywords (e.g. "AI summit", "crypto meetup") | — |
| `city` | string | City name (e.g. "San Francisco", "London") | — |
| `country` | string | Country code (e.g. "us", "gb", "de") | "us" |
| `dateFrom` | string | Start date filter (YYYY-MM-DD) | — |
| `dateTo` | string | End date filter (YYYY-MM-DD) | — |
| `category` | string | Eventbrite category (e.g. "technology", "business", "music") | — |
| `priceType` | string | "free", "paid", or "both" | "both" |
| `maxPages` | number | Pages to scrape (each ~20 events) | 5 |
| `maxResults` | number | Maximum events to return | 100 |

## Output Fields

Each event in the dataset contains:

| Field | Description |
|-------|-------------|
| `name` | Event title |
| `url` | Eventbrite event page (direct ticket link) |
| `startAt` | ISO 8601 start datetime |
| `endDate` | ISO 8601 end datetime (if available) |
| `description` | Plain text description |
| `location` | "City, Country" string |
| `venue` | Object: name, address, city, country, lat, lng |
| `isOnline` | Boolean — true if virtual event |
| `isFree` | Boolean |
| `ticketPrice` | Price string (e.g. "25 USD") or "Free" |
| `ticketUrl` | Direct link to purchase tickets |
| `organizer` | Organizer name |
| `imageUrl` | Event cover image URL |
| `scrapedAt` | Timestamp when event was scraped |

## Example Input

```json
{
  "query": "AI startup",
  "city": "San Francisco",
  "country": "us",
  "dateFrom": "2026-05-01",
  "dateTo": "2026-08-31",
  "category": "technology",
  "priceType": "both",
  "maxPages": 3,
  "maxResults": 60
}
```

## Example Output

```json
{
  "name": "AI Founders Summit 2026",
  "url": "https://www.eventbrite.com/e/ai-founders-summit-2026-tickets-1234567890",
  "startAt": "2026-06-15T18:00:00.000Z",
  "location": "San Francisco, US",
  "venue": { "name": "Moscone Center", "city": "San Francisco", "country": "US" },
  "isOnline": false,
  "isFree": false,
  "ticketPrice": "299 USD",
  "organizer": "TechConf Events LLC",
  "source": "eventbrite",
  "scrapedAt": "2026-04-23T10:00:00.000Z"
}
```

## Questions answered by this actor

- Where are all the AI events in San Francisco this summer?
- What free business networking events are happening in New York?
- Who organizes the most technology conferences in London?
- What's the average ticket price for startup events in my city?
- Which music festivals are coming up in Austin next month?

## Frequently Asked Questions

**Does this require an Eventbrite API key?** No. This actor scrapes the public Eventbrite website using Playwright.

**How many events can I get per run?** Up to 400 events (20 pages × ~20 events each). Set `maxPages: 20, maxResults: 400`.

**How fresh is the data?** Data is scraped live each time you run the actor.

**Can I schedule this actor?** Yes — use Apify's built-in scheduling to run daily or weekly and keep your dataset fresh.

**What Eventbrite categories can I use?** Common slugs: `technology`, `business`, `music`, `food-and-drink`, `arts`, `science-and-tech`, `sports`, `health`, `family-education`, `charity`.
