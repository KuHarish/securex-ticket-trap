import express from 'express';
import { getUserStatus } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', getUserStatus);

export default router;
