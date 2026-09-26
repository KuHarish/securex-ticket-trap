import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let clientConfig = {};

if (process.env.REDIS_HOST) {
  // Use Redis Cloud / discrete parameters
  clientConfig = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '11670', 10)
    }
  };
} else {
  // Fallback to REDIS_URL or local
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  clientConfig = { url: redisUrl };
}

const redisClient = createClient(clientConfig);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('ready', () => {
  console.log(`Connected to Redis at ${process.env.REDIS_HOST || 'localhost'}`);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    
    // Attempt to enable keyspace notifications
    // Managed clouds often block CONFIG SET and require it to be set in their web dashboard.
    try {
      await redisClient.configSet('notify-keyspace-events', 'Ex');
    } catch (e) {
      console.warn('⚠️ Could not set notify-keyspace-events programmatically. If you are using Redis Cloud, please ensure "notify-keyspace-events" is set to "Ex" in your Cloud database configuration dashboard. Without this, reservations will not expire automatically.');
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

export default redisClient;
