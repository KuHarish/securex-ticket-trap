import { demoUser } from '../data/store.js';
import { getPurchaseSummary } from '../services/bookingService.js';

export const getUserStatus = (req, res) => {
  const { eventId } = req.query;
  const summary = eventId ? getPurchaseSummary(demoUser.userId, eventId) : null;

  res.status(200).json({
    success: true,
    user: demoUser,
    purchaseSummary: summary
  });
};
