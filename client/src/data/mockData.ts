import { EventDetails, Seat } from '../types';

export const mockEvent: EventDetails = {
  id: 'EVT-7729',
  name: 'Secure X Tech Fest',
  category: 'Technology Conference',
  date: '26 September 2026',
  time: '10:00 AM - 06:00 PM',
  venue: 'Main Auditorium',
  location: 'Cyber Hub, Bangalore',
  description: 'Join the premier cybersecurity and tech innovation festival. Discover new trends, participate in workshops, and network with industry leaders.',
  ticketPrice: 500,
  purchaseLimit: 2,
};

// Generate realistic mock seats A1-A5, B1-B5, C1-C5, D1-D5
const rows = ['A', 'B', 'C', 'D'];
const cols = [1, 2, 3, 4, 5];

export const mockSeats: Seat[] = rows.flatMap((row) =>
  cols.map((col) => {
    const id = `${row}${col}`;
    // Pre-populate some seats as sold
    const isSold = ['A2', 'B3', 'C1', 'D4', 'D5'].includes(id);
    return {
      id,
      label: id,
      status: isSold ? 'sold' : 'available',
    };
  })
);
