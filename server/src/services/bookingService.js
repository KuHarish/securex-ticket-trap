import { bookings } from '../data/store.js';
import { config } from '../config/config.js';

export const getUserPurchasedTicketCount = (userId, eventId) => {
  return bookings
    .filter(b => b.userId === userId && b.eventId === eventId && b.status === 'CONFIRMED')
    .reduce((total, b) => total + b.quantity, 0);
};

export const getPurchaseSummary = (userId, eventId) => {
  const purchased = getUserPurchasedTicketCount(userId, eventId);
  return {
    purchased,
    limit: config.MAX_TICKETS_PER_USER,
    remaining: Math.max(0, config.MAX_TICKETS_PER_USER - purchased)
  };
};

export const createBookingRecord = (bookingData) => {
  const newBooking = {
    bookingId: `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    ...bookingData,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  return newBooking;
};
