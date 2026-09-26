import { demoUser, bookings } from '../data/store.js';
import { getPurchaseSummary } from '../services/bookingService.js';
import { ticketService } from '../services/ticketService.js';

export const getUserStatus = (req, res) => {
  const { eventId } = req.query;
  const summary = eventId ? getPurchaseSummary(demoUser.userId, eventId) : null;

  res.status(200).json({
    success: true,
    user: demoUser,
    purchaseSummary: summary
  });
};

export const getUserTickets = async (req, res) => {
  const userId = demoUser.userId;
  const userBookings = bookings.filter(b => b.userId === userId);
  
  let allTickets = [];
  try {
    for (const booking of userBookings) {
      const tickets = await ticketService.getOrGenerateTickets(booking.bookingId, userId);
      allTickets = [...allTickets, ...tickets];
    }
    return res.json({ success: true, tickets: allTickets });
  } catch (error) {
    console.error("Failed to fetch user tickets:", error);
    return res.status(500).json({ success: false, message: 'Internal error fetching tickets' });
  }
};
