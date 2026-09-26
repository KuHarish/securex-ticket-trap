import express from 'express';
import { getUserStatus, getUserTickets } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', getUserStatus);
router.get('/me/tickets', getUserTickets);

export default router;
