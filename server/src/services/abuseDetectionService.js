import crypto from 'crypto';
import redisClient from '../config/redis.js';
import { config } from '../config/config.js';

const rateLimitScript = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = redis.call('GET', key)
if current and tonumber(current) >= limit then
  return -1 -- Rate limited
end

local count = redis.call('INCR', key)
if count == 1 then
  redis.call('EXPIRE', key, window)
end
return count
`;

const duplicateRequestScript = `
local key = KEYS[1]
local window = tonumber(ARGV[1])

local current = redis.call('GET', key)
if current then 
  return -1 -- Duplicate
end

redis.call('SET', key, '1', 'EX', window)
return 1
`;

export const abuseDetectionService = {
  /**
   * Generates a deterministic fingerprint for a booking request
   */
  generateBookingFingerprint: (eventId, ticketIds) => {
    if (!eventId || !ticketIds || !Array.isArray(ticketIds)) return null;
    // Sort to handle ["A1", "A2"] == ["A2", "A1"]
    const sortedTickets = [...ticketIds].sort();
    const payload = `${eventId}:${sortedTickets.join(',')}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  },

  /**
   * Increases abuse score. If threshold is reached, creates a temporary block.
   */
  async recordSuspiciousActivity(identity, points = 1) {
    if (!redisClient.isReady) return;
    
    this.incrementStat('suspiciousRequests');
    this.logSecurityEvent('Suspicious Request', `Identity ${identity} accumulated ${points} abuse points.`);

    const abuseKey = `abuse_score:${identity}`;
    const blockKey = `blocked:${identity}`;
    
    // We increment score. TTL 5 minutes for score accumulation.
    const score = await redisClient.incrBy(abuseKey, points);
    if (score === points) {
      await redisClient.expire(abuseKey, 300); 
    }

    if (score >= config.ABUSE_THRESHOLD) {
      console.log(`[SECURITY] Identity ${identity} temporarily throttled. Score: ${score}`);
      this.incrementStat('activeThrottles');
      this.logSecurityEvent('Temporary Throttle Activated', `Identity ${identity} blocked for exceeding abuse threshold.`);
      await redisClient.set(blockKey, '1', { EX: config.ABUSE_BLOCK_SECONDS });
    }
  },

  /**
   * Check if identity is currently temporarily blocked
   */
  async isTemporarilyBlocked(identity) {
    if (!redisClient.isReady) return false;
    const isBlocked = await redisClient.get(`blocked:${identity}`);
    if (isBlocked) {
      const ttl = await redisClient.ttl(`blocked:${identity}`);
      return { blocked: true, retryAfter: ttl > 0 ? ttl : config.ABUSE_BLOCK_SECONDS };
    }
    return { blocked: false };
  },

  /**
   * Check duplicate request window
   */
  async isDuplicateBookingRequest(identity, fingerprint) {
    if (!redisClient.isReady || !fingerprint) return false;
    
    const key = `duplicate_check:${identity}:${fingerprint}`;
    const result = await redisClient.eval(duplicateRequestScript, {
      keys: [key],
      arguments: [config.DUPLICATE_REQUEST_WINDOW_SECONDS.toString()]
    });

    if (result === -1) {
      this.incrementStat('duplicateRequests');
      this.logSecurityEvent('Duplicate Request', `Identical booking request detected from ${identity}.`);
      return true;
    }
    return false;
  },

  /**
   * Check endpoint rate limit
   */
  async checkRateLimit(key, limit, windowSeconds) {
    if (!redisClient.isReady) return { allowed: true }; // Fail open if Redis is down

    const result = await redisClient.eval(rateLimitScript, {
      keys: [key],
      arguments: [limit.toString(), windowSeconds.toString()]
    });

    if (result === -1) {
      this.logSecurityEvent('Rate Limit Triggered', `Identity blocked from endpoint for ${windowSeconds}s`);
      this.incrementStat('rateLimitedRequests');
      const ttl = await redisClient.ttl(key);
      return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSeconds };
    }

    return { allowed: true, remaining: limit - result };
  },

  // --- DEMO DASHBOARD METHODS ---
  _stats: {
    bookingRequests: 0,
    rateLimitedRequests: 0,
    duplicateRequests: 0,
    suspiciousRequests: 0,
    activeThrottles: 0,
    successfulBookings: 0,
    failedBookings: 0,
    ticketsIssued: 0,
    ticketsValidated: 0,
    ticketsRejected: 0
  },
  _events: [],

  incrementStat(statKey) {
    if (this._stats[statKey] !== undefined) {
      this._stats[statKey]++;
    }
  },

  logSecurityEvent(title, description) {
    this._events.unshift({
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      title,
      description
    });
    // Keep only last 20
    if (this._events.length > 20) this._events.pop();
  },

  getStats() {
    return {
      stats: this._stats,
      events: this._events
    };
  }
};
