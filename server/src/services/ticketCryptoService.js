import crypto from 'crypto';
import { config } from '../config/config.js';

/**
 * Creates a deterministic JSON representation of the payload.
 */
const toCanonicalString = (payload) => {
  // Sort keys to ensure deterministic ordering
  const sortedKeys = Object.keys(payload).sort();
  const canonicalObj = {};
  for (const key of sortedKeys) {
    canonicalObj[key] = payload[key];
  }
  return JSON.stringify(canonicalObj);
};

export const ticketCryptoService = {
  /**
   * Generates a cryptographic HMAC-SHA256 signature for the given payload.
   */
  signPayload: (payload) => {
    const secret = config.TICKET_SIGNING_SECRET;
    if (!secret || secret === 'dev_fallback_secret_do_not_use_in_prod') {
      console.warn("WARNING: Using fallback ticket signing secret. Do not use in production.");
    }
    
    const canonicalString = toCanonicalString(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(canonicalString);
    return hmac.digest('base64url');
  },

  /**
   * Encodes payload and attaches signature to create a compact QR-ready token.
   */
  createSecureToken: (payload) => {
    const canonicalString = toCanonicalString(payload);
    const encodedPayload = Buffer.from(canonicalString).toString('base64url');
    const signature = ticketCryptoService.signPayload(payload);
    return `${encodedPayload}.${signature}`;
  },

  /**
   * Verifies the secure token. (Primarily for testing Module 4, full validation is Module 5)
   */
  verifySecureToken: (token) => {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    try {
      const canonicalString = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload = JSON.parse(canonicalString);
      
      const expectedSignature = ticketCryptoService.signPayload(payload);
      
      // Timing-safe comparison to prevent timing attacks
      const expectedBuffer = Buffer.from(expectedSignature);
      const actualBuffer = Buffer.from(signature);
      
      if (expectedBuffer.length !== actualBuffer.length) return null;
      if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) return null;
      
      return payload;
    } catch (err) {
      return null;
    }
  }
};
