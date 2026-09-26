import redisClient from '../config/redis.js';
import { ticketCryptoService } from './ticketCryptoService.js';
import { generatedTickets } from './ticketService.js';

// Lua script to atomically transition ticket status from ISSUED to USED
const checkInScript = `
local statusKey = KEYS[1]
local currentStatus = redis.call('GET', statusKey)

if currentStatus == 'ISSUED' then
  redis.call('SET', statusKey, 'USED')
  return 'SUCCESS'
elseif currentStatus == 'USED' then
  return 'ALREADY_USED'
elseif currentStatus == 'CANCELLED' then
  return 'CANCELLED'
else
  return 'UNKNOWN'
end
`;

export const ticketValidationService = {
  /**
   * Validates a ticket token without modifying its state.
   */
  async validateTicket(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, status: 'INVALID', message: 'Token is missing or malformed.' };
    }

    // 1. Cryptographic Verification
    const payload = ticketCryptoService.verifySecureToken(token);
    
    if (!payload) {
      return { valid: false, status: 'TAMPERED', message: 'Ticket data could not be verified.' };
    }

    // 2. Ticket Existence Check
    const { ticketId, bookingId, eventId, seatId } = payload;
    
    const ticketRecord = generatedTickets.find(t => t.ticketId === ticketId);
    
    if (!ticketRecord) {
      return { valid: false, status: 'INVALID', message: 'Unknown ticket.' };
    }

    // Double check internal record matches payload data
    if (ticketRecord.bookingId !== bookingId || ticketRecord.eventId !== eventId || ticketRecord.seatId !== seatId) {
      return { valid: false, status: 'INVALID', message: 'Ticket data mismatch.' };
    }

    // 3. Ticket Status Check (from Redis for real-time accuracy)
    let currentStatus = ticketRecord.status; // fallback
    if (redisClient.isReady) {
      const redisStatus = await redisClient.get(`ticket_status:${ticketId}`);
      if (redisStatus) currentStatus = redisStatus;
    }

    if (currentStatus === 'USED') {
      return { valid: false, status: 'ALREADY_USED', message: 'This ticket has already been checked in.' };
    }

    if (currentStatus === 'CANCELLED') {
      return { valid: false, status: 'CANCELLED', message: 'This ticket has been cancelled.' };
    }
    
    if (currentStatus !== 'ISSUED') {
      return { valid: false, status: 'INVALID', message: 'Invalid ticket status.' };
    }

    // Valid
    return {
      valid: true,
      status: 'VALID',
      message: 'Ticket is valid.',
      ticket: {
        ticketId: ticketRecord.ticketId,
        eventId: ticketRecord.eventId,
        seatId: ticketRecord.seatId,
        issuedAt: payload.issuedAt
      }
    };
  },

  /**
   * Atomically checks in a ticket (ISSUED -> USED)
   */
  async checkInTicket(token) {
    // First run validation
    const validationResult = await this.validateTicket(token);
    
    if (!validationResult.valid) {
      return validationResult; // Return the exact error state
    }

    const ticketId = validationResult.ticket.ticketId;

    if (!redisClient.isReady) {
      return { valid: false, status: 'ERROR', message: 'Check-in service unavailable (Redis down).' };
    }

    // Atomically transition status in Redis
    const checkInResult = await redisClient.eval(checkInScript, {
      keys: [`ticket_status:${ticketId}`],
      arguments: []
    });

    if (checkInResult === 'SUCCESS') {
      // Update memory store as well to keep it somewhat in sync
      const record = generatedTickets.find(t => t.ticketId === ticketId);
      if (record) record.status = 'USED';

      return {
        valid: true,
        status: 'CHECKIN_SUCCESS',
        message: 'Ticket checked in successfully.',
        ticket: validationResult.ticket
      };
    } else if (checkInResult === 'ALREADY_USED') {
      return { valid: false, status: 'ALREADY_USED', message: 'This ticket has already been checked in.' };
    } else if (checkInResult === 'CANCELLED') {
      return { valid: false, status: 'CANCELLED', message: 'This ticket has been cancelled.' };
    } else {
      return { valid: false, status: 'INVALID', message: 'Invalid ticket status during check-in.' };
    }
  }
};
