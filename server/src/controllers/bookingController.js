import { demoUser } from '../data/store.js';
import { getPurchaseSummary, createBookingRecord } from '../services/bookingService.js';
import { config } from '../config/config.js';
import { inventoryService } from '../services/inventoryService.js';
import { abuseDetectionService } from '../services/abuseDetectionService.js';

export const createBooking = async (req, res) => {
  const { eventId, ticketIds } = req.body;

  // Basic validation
  if (!eventId || typeof eventId !== 'string') {
    await abuseDetectionService.recordSuspiciousActivity(req.ip || 'anonymous', 1);
    return res.status(400).json({ success: false, error: 'INVALID_EVENT', message: 'Invalid event ID.' });
  }

  if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
    await abuseDetectionService.recordSuspiciousActivity(req.ip || 'anonymous', 1);
    return res.status(400).json({ success: false, error: 'INVALID_TICKETS', message: 'Invalid or missing tickets.' });
  }

  // Ensure no duplicate tickets in a single request
  const uniqueTickets = [...new Set(ticketIds)];
  if (uniqueTickets.length !== ticketIds.length) {
    return res.status(400).json({ success: false, error: 'DUPLICATE_TICKETS', message: 'Duplicate tickets in request.' });
  }

  const requestedQuantity = uniqueTickets.length;
  
  if (requestedQuantity <= 0) {
      return res.status(400).json({ success: false, error: 'INVALID_QUANTITY', message: 'Quantity must be positive.' });
  }

  // Resolve user identity
  const userId = demoUser.userId;

  // Check purchase limit securely
  const summary = getPurchaseSummary(userId, eventId);
  const existingPurchasedQuantity = summary.purchased;

  if (existingPurchasedQuantity + requestedQuantity > config.MAX_TICKETS_PER_USER) {
    // Record suspicious activity for repeatedly trying to bypass purchase limit
    await abuseDetectionService.recordSuspiciousActivity(userId || req.ip || 'anonymous', 1);
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

  // Generate a reservation ID or use provided
  const reservationId = req.body.reservationId || `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    abuseDetectionService.incrementStat('bookingRequests');

    // Atomically Reserve Inventory
    const reservationSuccess = await inventoryService.reserveTickets(eventId, ticketIds, reservationId);
    
    if (!reservationSuccess) {
      abuseDetectionService.incrementStat('failedBookings');
      return res.status(409).json({
        success: false,
        error: 'TICKET_UNAVAILABLE',
        message: 'One or more selected tickets are no longer available.'
      });
    }

    try {
      // Process Booking
      const ticketPrice = 500;
      const totalAmount = requestedQuantity * ticketPrice; 

      const booking = createBookingRecord({
        userId,
        eventId,
        ticketIds,
        quantity: requestedQuantity,
        totalAmount
      });

      // Confirm tickets in Redis (mark SOLD and remove locks)
      await inventoryService.confirmTickets(eventId, ticketIds);

      // Recalculate summary after successful booking
      const newSummary = getPurchaseSummary(userId, eventId);

      abuseDetectionService.incrementStat('successfulBookings');
      abuseDetectionService.logSecurityEvent('Booking Successful', `Booking ID ${booking.bookingId} confirmed for ${requestedQuantity} seats.`);

      return res.status(200).json({
        success: true,
        booking,
        purchaseSummary: newSummary,
        message: 'Booking confirmed'
      });
    } catch (bookingError) {
      // Rollback on unexpected error during booking creation
      await inventoryService.releaseTickets(eventId, ticketIds);
      abuseDetectionService.incrementStat('failedBookings');
      throw bookingError;
    }
  } catch (error) {
    console.error("Booking error:", error);
    abuseDetectionService.incrementStat('failedBookings');
    return res.status(500).json({
      success: false,
      error: 'BOOKING_FAILED',
      message: 'Booking service temporarily unavailable. Please try again.'
    });
  }
};
