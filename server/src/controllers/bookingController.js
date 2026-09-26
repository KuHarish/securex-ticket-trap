import { demoUser } from '../data/store.js';
import { getPurchaseSummary, createBookingRecord } from '../services/bookingService.js';
import { config } from '../config/config.js';

export const createBooking = (req, res) => {
  const { eventId, ticketIds } = req.body;

  // Basic validation
  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ success: false, error: 'INVALID_EVENT', message: 'Invalid event ID.' });
  }

  if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
    return res.status(400).json({ success: false, error: 'INVALID_TICKETS', message: 'Invalid or missing tickets.' });
  }

  // Ensure no duplicate tickets in a single request
  const uniqueTickets = [...new Set(ticketIds)];
  if (uniqueTickets.length !== ticketIds.length) {
    return res.status(400).json({ success: false, error: 'DUPLICATE_TICKETS', message: 'Duplicate tickets in request.' });
  }

  // Calculate requested quantity solely from ticketIds
  const requestedQuantity = uniqueTickets.length;
  
  if (requestedQuantity <= 0) {
      return res.status(400).json({ success: false, error: 'INVALID_QUANTITY', message: 'Quantity must be positive.' });
  }

  // Resolve user identity consistently
  const userId = demoUser.userId;

  // Calculate existing purchases securely on the backend
  const summary = getPurchaseSummary(userId, eventId);
  const existingPurchasedQuantity = summary.purchased;

  // Check purchase limit against backend calculated values
  if (existingPurchasedQuantity + requestedQuantity > config.MAX_TICKETS_PER_USER) {
    return res.status(409).json({
      success: false,
      error: 'PURCHASE_LIMIT_EXCEEDED',
      message: `You have reached the maximum ticket limit of ${config.MAX_TICKETS_PER_USER}.`,
      limit: config.MAX_TICKETS_PER_USER,
      purchased: existingPurchasedQuantity,
      requested: requestedQuantity,
      remaining: summary.remaining
    });
  }

  // Process booking
  setTimeout(() => {
    // Basic mock price calculation (in real world, fetch event price from DB)
    const ticketPrice = 500;
    const totalAmount = requestedQuantity * ticketPrice; 

    const booking = createBookingRecord({
      userId,
      eventId,
      ticketIds,
      quantity: requestedQuantity,
      totalAmount
    });

    // Recalculate summary after successful booking
    const newSummary = getPurchaseSummary(userId, eventId);

    return res.status(200).json({
      success: true,
      booking,
      purchaseSummary: newSummary,
      message: 'Booking confirmed'
    });
  }, 800);
};
