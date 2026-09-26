import { ticketCryptoService } from './src/services/ticketCryptoService.js';
import dotenv from 'dotenv';
dotenv.config();

console.log("=========================================");
console.log("TICKET TRAP - CRYPTOGRAPHIC INTEGRITY TEST");
console.log("=========================================\n");

// 1. Original payload
const originalPayload = {
  ticketId: "TKT-2026-A1B2C3D4",
  bookingId: "BK-XYZ123",
  eventId: "EVT-001",
  seatId: "A1",
  issuedAt: new Date().toISOString(),
  version: 1
};

console.log("Original Payload:");
console.log(originalPayload);
console.log("\nGenerating secure token...");

// 2. Generate secure token
const secureToken = ticketCryptoService.createSecureToken(originalPayload);
console.log("\nGenerated Token (EncodedPayload.Signature):");
console.log(secureToken);

// 3. Verify original token
console.log("\nVerifying original token...");
const verifiedOriginal = ticketCryptoService.verifySecureToken(secureToken);
if (verifiedOriginal) {
  console.log("✅ SUCCESS: Original token is VALID.");
} else {
  console.log("❌ ERROR: Original token failed verification.");
}

// 4. Tamper with the token payload (e.g. attacker changes seat to A5)
console.log("\n-----------------------------------------");
console.log("\nSimulating attacker tampering with payload (Changing Seat A1 to A5)...");

const [encodedPayload, signature] = secureToken.split('.');

// Decode, modify, and re-encode payload (without changing signature)
const decodedString = Buffer.from(encodedPayload, 'base64url').toString('utf8');
const tamperedPayloadObj = JSON.parse(decodedString);
tamperedPayloadObj.seatId = "A5"; // Tampering!

// Helper function from service to ensure keys are sorted
const toCanonicalString = (payload) => {
  const sortedKeys = Object.keys(payload).sort();
  const canonicalObj = {};
  for (const key of sortedKeys) {
    canonicalObj[key] = payload[key];
  }
  return JSON.stringify(canonicalObj);
};

const tamperedString = toCanonicalString(tamperedPayloadObj);
const tamperedEncoded = Buffer.from(tamperedString).toString('base64url');

const tamperedToken = `${tamperedEncoded}.${signature}`;
console.log("\nTampered Token (ModifiedPayload.OriginalSignature):");
console.log(tamperedToken);

// 5. Verify tampered token
console.log("\nVerifying tampered token...");
const verifiedTampered = ticketCryptoService.verifySecureToken(tamperedToken);

if (verifiedTampered) {
  console.log("❌ SECURITY FAILURE: Tampered token was accepted as valid!");
} else {
  console.log("✅ TAMPERING DETECTED: Tampered token was REJECTED because the signature does not match the modified payload.");
}

console.log("\n=========================================");
