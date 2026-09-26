import redisClient from '../config/redis.js';

const RESERVATION_TTL = parseInt(process.env.RESERVATION_TIMEOUT_SECONDS || '120', 10);

// Lua Script: Atomically checks if all tickets are available (not SOLD and not LOCKED)
// Then locks all of them for a specific reservationId with a TTL.
// KEYS = [lock:event:t1, lock:event:t2, ..., ticket:event:t1, ticket:event:t2, ...]
// ARGV = [reservationId, ttl]
const reserveScript = `
local numTickets = #KEYS / 2
local resId = ARGV[1]
local ttl = tonumber(ARGV[2])

-- Phase 1: Check availability of all requested tickets
for i = 1, numTickets do
  local lockKey = KEYS[i]
  local ticketKey = KEYS[i + numTickets]
  
  -- Check if ticket is permanently sold
  local ticketStatus = redis.call('GET', ticketKey)
  if ticketStatus == 'SOLD' then
    return 0 -- Failed: ticket is sold
  end
  
  -- Check if ticket is temporarily locked by another reservation
  if redis.call('EXISTS', lockKey) == 1 then
    return 0 -- Failed: ticket is locked
  end
end

-- Phase 2: Lock all requested tickets
for i = 1, numTickets do
  local lockKey = KEYS[i]
  redis.call('SET', lockKey, resId, 'EX', ttl)
end

return 1 -- Success
`;

export const inventoryService = {
  /**
   * Safe idempotent initialization of tickets into Redis.
   * Only sets "AVAILABLE" if the key doesn't already exist.
   */
  async initializeEvent(eventId, allSeatIds) {
    if (!redisClient.isReady) return;
    
    // We use a pipeline/multi to initialize all at once efficiently
    const multi = redisClient.multi();
    for (const seatId of allSeatIds) {
      multi.setNX(`ticket:${eventId}:${seatId}`, 'AVAILABLE');
    }
    await multi.exec();
    console.log(`Initialized inventory for event ${eventId}`);
  },

  /**
   * Atomically reserve multiple tickets using Lua script.
   */
  async reserveTickets(eventId, ticketIds, reservationId) {
    if (!redisClient.isReady) throw new Error("Redis is not available");

    const lockKeys = ticketIds.map(id => `lock:${eventId}:${id}`);
    const ticketKeys = ticketIds.map(id => `ticket:${eventId}:${id}`);
    const keys = [...lockKeys, ...ticketKeys];

    // execute Lua script
    const result = await redisClient.eval(reserveScript, {
      keys,
      arguments: [reservationId, RESERVATION_TTL.toString()]
    });

    return result === 1; // 1 = success, 0 = fail
  },

  /**
   * Atomically confirm the booking by marking tickets as SOLD and removing the locks.
   */
  async confirmTickets(eventId, ticketIds) {
    if (!redisClient.isReady) return;

    const multi = redisClient.multi();
    for (const seatId of ticketIds) {
      multi.set(`ticket:${eventId}:${seatId}`, 'SOLD');
      multi.del(`lock:${eventId}:${seatId}`);
    }
    await multi.exec();
  },

  /**
   * Rollback temporary reservations by deleting the locks.
   */
  async releaseTickets(eventId, ticketIds) {
    if (!redisClient.isReady) return;

    const multi = redisClient.multi();
    for (const seatId of ticketIds) {
      multi.del(`lock:${eventId}:${seatId}`);
    }
    await multi.exec();
  }
};
