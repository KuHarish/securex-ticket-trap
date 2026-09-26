import { abuseDetectionService } from '../services/abuseDetectionService.js';
import { config } from '../config/config.js';
import { demoUser } from '../data/store.js';

/**
 * Resolves a reliable identity for rate limiting (fallback to IP if user isn't logged in, though in this MVP we have a demo user).
 */
const resolveIdentity = (req) => {
  // In a real app this would use req.user.id extracted from a JWT auth middleware
  return demoUser?.userId || req.ip || 'anonymous';
};

export const bookingRateLimit = async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);
    console.log(`[MIDDLEWARE] Checking bookingRateLimit for identity: ${identity}`);

    // 1. Check if temporarily throttled due to abuse
    const blockCheck = await abuseDetectionService.isTemporarilyBlocked(identity);
    if (blockCheck.blocked) {
      console.warn(`[SECURITY] Rejected request from temporarily throttled identity: ${identity}`);
      return res.status(429).json({
        success: false,
        error: 'TEMPORARILY_THROTTLED',
        message: 'Too many suspicious requests. Please try again later.',
        retryAfter: blockCheck.retryAfter
      });
    }

    // 2. Duplicate Request Detection
    const { eventId, ticketIds } = req.body;
    if (eventId && ticketIds) {
      const fingerprint = abuseDetectionService.generateBookingFingerprint(eventId, ticketIds);
      const isDuplicate = await abuseDetectionService.isDuplicateBookingRequest(identity, fingerprint);
      
      if (isDuplicate) {
        console.warn(`[SECURITY] Duplicate booking request detected for identity: ${identity}`);
        // Increase abuse score slightly for spamming exactly identical requests
        await abuseDetectionService.recordSuspiciousActivity(identity, 1);
        
        return res.status(429).json({
          success: false,
          error: 'DUPLICATE_REQUEST',
          message: 'Duplicate request detected. Please wait a moment before trying again.',
          retryAfter: config.DUPLICATE_REQUEST_WINDOW_SECONDS
        });
      }
    }

    // 3. Endpoint Rate Limiting
    const rateLimitKey = `rate_limit:booking:${identity}`;
    const rateCheck = await abuseDetectionService.checkRateLimit(
      rateLimitKey, 
      config.BOOKING_REQUEST_LIMIT, 
      config.BOOKING_REQUEST_WINDOW_SECONDS
    );

    if (!rateCheck.allowed) {
      console.warn(`[SECURITY] Booking rate limit exceeded for identity: ${identity}`);
      await abuseDetectionService.recordSuspiciousActivity(identity, 1);
      
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many booking attempts. Please try again later.',
        retryAfter: rateCheck.retryAfter
      });
    }

    next();
  } catch (err) {
    console.error('Rate limit middleware error:', err);
    next(); // Fail open to not completely block normal usage if Redis goes down strangely
  }
};

export const validationRateLimit = async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);

    const blockCheck = await abuseDetectionService.isTemporarilyBlocked(identity);
    if (blockCheck.blocked) {
      return res.status(429).json({
        valid: false,
        status: 'TEMPORARILY_THROTTLED',
        message: 'Too many validation attempts. Please try again later.'
      });
    }

    const rateLimitKey = `rate_limit:validation:${identity}`;
    const rateCheck = await abuseDetectionService.checkRateLimit(
      rateLimitKey, 
      config.VALIDATION_REQUEST_LIMIT, 
      config.VALIDATION_REQUEST_WINDOW_SECONDS
    );

    if (!rateCheck.allowed) {
      console.warn(`[SECURITY] Validation rate limit exceeded for identity: ${identity}`);
      await abuseDetectionService.recordSuspiciousActivity(identity, 1);
      
      return res.status(429).json({
        valid: false,
        status: 'RATE_LIMITED',
        message: 'Too many validation requests. Please try again later.'
      });
    }

    next();
  } catch (err) {
    console.error('Validation rate limit error:', err);
    next();
  }
};
