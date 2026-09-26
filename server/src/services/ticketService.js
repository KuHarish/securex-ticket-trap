import crypto from 'crypto';
import { bookings } from '../data/store.js';
import { ticketCryptoService } from './ticketCryptoService.js';
import { qrService } from './qrService.js';

// Memory store for tickets to ensure idempotency and persistence during this demo
export const generatedTickets = [];

export const ticketService = {
  /**
   * Generates or retrieves secure tickets for a confirmed booking
   */
  async getOrGenerateTickets(bookingId, userId) {
    // 1. Validate the booking exists
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (!booking) {
      throw new Error("BOOKING_NOT_FOUND");
    }
    
    // 2. Authorize
    if (booking.userId !== userId) {
      throw new Error("UNAUTHORIZED_ACCESS");
    }

    // 3. Confirm booking is actually confirmed
    if (booking.status !== 'CONFIRMED') {
      throw new Error("BOOKING_NOT_CONFIRMED");
    }

    // 4. Check if we already generated tickets for this booking (Idempotency)
    let existingTickets = generatedTickets.filter(t => t.bookingId === bookingId);
    
    if (existingTickets.length > 0) {
      // Tickets already exist, return them
      return existingTickets;
    }

    // 5. Generate secure tickets for each reserved seat (One ticket per reserved seat)
    const newTickets = [];
    
    for (const seatId of booking.ticketIds) {
      // Cryptographically secure random ticket ID (e.g. TKT-2026-8F4A92C1)
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const ticketId = `TKT-${new Date().getFullYear()}-${randomHex}`;
      
      const payload = {
        ticketId,
        bookingId: booking.bookingId,
        eventId: booking.eventId,
        seatId: seatId,
        issuedAt: new Date().toISOString(),
        version: 1
      };

      const secureToken = ticketCryptoService.createSecureToken(payload);
      const qrDataUri = await qrService.generateQRDataURI(secureToken);

      // Initialize status in Redis to support atomic check-ins
      try {
        const { default: redisClient } = await import('../config/redis.js');
        if (redisClient.isReady) {
          await redisClient.setNX(`ticket_status:${ticketId}`, 'ISSUED');
        }
      } catch (err) {
        console.warn("Could not set Redis status", err);
      }

      const ticketRecord = {
        ticketId,
        bookingId: booking.bookingId,
        eventId: booking.eventId,
        seatId,
        status: 'ISSUED',
        qrCode: qrDataUri,
        // The token is primarily stored to pass to the frontend, though backend can re-derive it
        token: secureToken 
      };

      newTickets.push(ticketRecord);
      generatedTickets.push(ticketRecord);
    }

    return newTickets;
  }
};
