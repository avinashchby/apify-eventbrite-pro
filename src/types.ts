export interface InputSchema {
  query?: string;
  city?: string;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  priceType?: 'free' | 'paid' | 'both';
  maxPages: number;
  maxResults: number;
}

export interface VenueInfo {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface EventItem {
  name: string;
  url: string;
  startAt: string;
  endDate?: string;
  description: string;
  location: string;
  venue?: VenueInfo;
  isOnline: boolean;
  isFree: boolean;
  ticketPrice?: string;
  ticketUrl?: string;
  imageUrl?: string;
  organizer?: string;
  source: 'eventbrite';
  scrapedAt: string;
}
