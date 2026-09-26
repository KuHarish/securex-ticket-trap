import express from 'express';
import { abuseDetectionService } from '../services/abuseDetectionService.js';

const router = express.Router();

router.get('/stats', (req, res) => {
  res.json(abuseDetectionService.getStats());
});

export default router;
