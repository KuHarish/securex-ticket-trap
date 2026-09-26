import express from 'express';
import { getTickets, validateTicket, checkInTicket } from '../controllers/ticketController.js';
import { validationRateLimit } from '../middleware/abuseDetectionMiddleware.js';

const router = express.Router();

router.post('/validate', validationRateLimit, validateTicket);
router.post('/checkin', validationRateLimit, checkInTicket);
router.get('/:bookingId', getTickets);

export default router;
