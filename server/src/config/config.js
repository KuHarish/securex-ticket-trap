import dotenv from 'dotenv';
dotenv.config();

export const config = {
  MAX_TICKETS_PER_USER: 2,
  TICKET_SIGNING_SECRET: process.env.TICKET_SIGNING_SECRET || 'dev_fallback_secret_do_not_use_in_prod',
  
  // Rate Limiting & Abuse Detection
  BOOKING_REQUEST_LIMIT: parseInt(process.env.BOOKING_REQUEST_LIMIT || '5', 10),
  BOOKING_REQUEST_WINDOW_SECONDS: parseInt(process.env.BOOKING_REQUEST_WINDOW_SECONDS || '60', 10),
  VALIDATION_REQUEST_LIMIT: parseInt(process.env.VALIDATION_REQUEST_LIMIT || '20', 10),
  VALIDATION_REQUEST_WINDOW_SECONDS: parseInt(process.env.VALIDATION_REQUEST_WINDOW_SECONDS || '60', 10),
  DUPLICATE_REQUEST_WINDOW_SECONDS: parseInt(process.env.DUPLICATE_REQUEST_WINDOW_SECONDS || '5', 10),
  ABUSE_BLOCK_SECONDS: parseInt(process.env.ABUSE_BLOCK_SECONDS || '60', 10),
  ABUSE_THRESHOLD: parseInt(process.env.ABUSE_THRESHOLD || '5', 10),
};
