import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis at', redisUrl);
    
    // Enable keyspace notifications for expired events ('Ex')
    try {
      await redisClient.configSet('notify-keyspace-events', 'Ex');
    } catch (e) {
      console.warn('Could not set notify-keyspace-events. Ensure Redis has permissions.');
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

export default redisClient;
