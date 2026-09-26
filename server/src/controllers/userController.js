import { demoUser, bookings } from '../data/store.js';
import { getPurchaseSummary } from '../services/bookingService.js';
import { ticketService } from '../services/ticketService.js';

export const getUserStatus = (req, res) => {
  const { eventId } = req.query;
  const userId = req.ip || demoUser.userId;
  const summary = eventId ? getPurchaseSummary(userId, eventId) : null;

  res.status(200).json({
    success: true,
    user: { ...demoUser, userId: userId, name: `Demo User (${userId})` },
    purchaseSummary: summary
  });
};

export const getUserTickets = async (req, res) => {
  const userId = req.ip || demoUser.userId;
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
