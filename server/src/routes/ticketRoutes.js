import express from 'express';
import { getTickets, validateTicket, checkInTicket } from '../controllers/ticketController.js';

const router = express.Router();

router.post('/validate', validateTicket);
router.post('/checkin', checkInTicket);
router.get('/:bookingId', getTickets);

export default router;
