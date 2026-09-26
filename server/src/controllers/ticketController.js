import { ticketService } from '../services/ticketService.js';
import { ticketValidationService } from '../services/ticketValidationService.js';
import { demoUser } from '../data/store.js';
import { abuseDetectionService } from '../services/abuseDetectionService.js';

export const validateTicket = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await ticketValidationService.validateTicket(token);
    
    if (result.valid) {
      abuseDetectionService.incrementStat('ticketsValidated');
      abuseDetectionService.logSecurityEvent('Ticket Validated', `Ticket ${result.ticket.ticketId} successfully validated.`);
    } else {
      abuseDetectionService.incrementStat('ticketsRejected');
      abuseDetectionService.logSecurityEvent('Ticket Rejected', `Reason: ${result.status}`);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Validation error:", err);
    return res.status(500).json({ valid: false, status: 'ERROR', message: 'Internal server error during validation.' });
  }
};

export const checkInTicket = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await ticketValidationService.checkInTicket(token);
    
    if (result.valid && result.status === 'USED') {
      abuseDetectionService.logSecurityEvent('Ticket Checked In', `Ticket ${result.ticket.ticketId} marked as USED.`);
    } else if (!result.valid) {
      abuseDetectionService.incrementStat('ticketsRejected');
      abuseDetectionService.logSecurityEvent('Check-in Rejected', `Reason: ${result.status}`);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Check-in error:", err);
    return res.status(500).json({ valid: false, status: 'ERROR', message: 'Internal server error during check-in.' });
  }
};

export const getTickets = async (req, res) => {
  const { bookingId } = req.params;
  
  if (!bookingId) {
    return res.status(400).json({ success: false, error: 'INVALID_BOOKING_ID', message: 'Booking ID is required.' });
  }

  try {
    const userId = demoUser.userId; // Securely resolve identity from backend
    const tickets = await ticketService.getOrGenerateTickets(bookingId, userId);
    
    return res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error("Ticket Generation Error:", error.message);
    
    let statusCode = 500;
    let errorCode = 'TICKET_GENERATION_FAILED';
    let message = 'Failed to generate tickets due to an internal error.';

    if (error.message === 'BOOKING_NOT_FOUND') {
      statusCode = 404;
      errorCode = 'BOOKING_NOT_FOUND';
      message = 'Booking could not be found.';
    } else if (error.message === 'UNAUTHORIZED_ACCESS') {
      statusCode = 403;
      errorCode = 'UNAUTHORIZED_ACCESS';
      message = 'You do not have permission to view these tickets.';
    } else if (error.message === 'BOOKING_NOT_CONFIRMED') {
      statusCode = 400;
      errorCode = 'BOOKING_NOT_CONFIRMED';
      message = 'Tickets cannot be generated for an unconfirmed booking.';
    }

    return res.status(statusCode).json({
      success: false,
      error: errorCode,
      message
    });
  }
};
