import express from 'express';
import { createBooking } from '../controllers/bookingController.js';
import { bookingRateLimit } from '../middleware/abuseDetectionMiddleware.js';

const router = express.Router();

router.post('/', bookingRateLimit, createBooking);

export default router;
