export type SeatStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED';

export interface Seat {
  id: string;
  label: string;
  status: SeatStatus;
}

export interface EventDetails {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  ticketPrice: number;
  purchaseLimit: number; // Initially mock limit, but now we'll rely on the server's PurchaseSummary
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface PurchaseSummary {
  purchased: number;
  limit: number;
  remaining: number;
}
