export type SeatStatus = 'available' | 'sold';

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
  purchaseLimit: number;
}
