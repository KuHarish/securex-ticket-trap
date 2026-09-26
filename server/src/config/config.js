import dotenv from 'dotenv';
dotenv.config();

export const config = {
  MAX_TICKETS_PER_USER: 2,
  TICKET_SIGNING_SECRET: process.env.TICKET_SIGNING_SECRET || 'dev_fallback_secret_do_not_use_in_prod'
};
