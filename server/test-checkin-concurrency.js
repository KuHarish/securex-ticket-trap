import { ticketCryptoService } from './src/services/ticketCryptoService.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3001/api/tickets/checkin';

async function runConcurrencyTest() {
  console.log("=========================================");
  console.log("TICKET TRAP - CONCURRENT CHECK-IN TEST");
  console.log("=========================================\n");

  // Generate a valid mock ticket to test
  const originalPayload = {
    ticketId: "TKT-TEST-CONCURRENCY",
    bookingId: "BK-CONCURRENCY",
    eventId: "EVT-001",
    seatId: "A1",
    issuedAt: new Date().toISOString(),
    version: 1
  };

  const secureToken = ticketCryptoService.createSecureToken(originalPayload);
  
  console.log("Setting up test ticket in Redis...");
  
  // We need to inject the ticket directly into the server's memory/Redis for testing
  try {
    const { default: redisClient } = await import('./src/config/redis.js');
    await redisClient.connect();
    
    // Set status to ISSUED directly in Redis
    await redisClient.set('ticket_status:TKT-TEST-CONCURRENCY', 'ISSUED');
    
    console.log("Ticket TKT-TEST-CONCURRENCY initialized as ISSUED in Redis.");
  } catch (err) {
    console.warn("Could not connect to Redis to set up test:", err.message);
    console.warn("Make sure Redis is running and try again.");
    process.exit(1);
  }

  // NOTE: For this script to work fully, the ticket must exist in the Node server's `generatedTickets` memory store.
  // Because `generatedTickets` is just an array, we can't easily push to it from this separate Node process.
  // We'll skip the exact `fetch` to localhost and test the Redis concurrency via the validation service directly.
  
  console.log("\nSimulating 10 identical simultaneous check-in requests...");
  
  // Directly test the ticketValidationService to bypass memory store limitation for this test script
  const { ticketValidationService } = await import('./src/services/ticketValidationService.js');
  
  // Mock the generatedTickets array inside ticketService
  const { generatedTickets } = await import('./src/services/ticketService.js');
  generatedTickets.push({
    ticketId: "TKT-TEST-CONCURRENCY",
    bookingId: "BK-CONCURRENCY",
    eventId: "EVT-001",
    seatId: "A1",
    status: "ISSUED"
  });

  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(
      (async () => {
        const start = Date.now();
        const result = await ticketValidationService.checkInTicket(secureToken);
        const elapsed = Date.now() - start;
        return { id: i, result, elapsed };
      })()
    );
  }

  const results = await Promise.all(promises);
  
  let successCount = 0;
  let rejectedCount = 0;

  for (const { id, result, elapsed } of results) {
    if (result.status === 'CHECKIN_SUCCESS') {
      successCount++;
      console.log(`[Request ${id}] SUCCESS in ${elapsed}ms - Ticket checked in!`);
    } else {
      rejectedCount++;
      console.log(`[Request ${id}] REJECTED in ${elapsed}ms: ${result.status} - ${result.message}`);
    }
  }

  console.log("\n-----------------------------------------");
  console.log("Test Complete.");
  console.log(`Total Requests: 10`);
  console.log(`Successful Check-ins: ${successCount} (Expected: 1)`);
  console.log(`Rejected (ALREADY_USED): ${rejectedCount} (Expected: 9)`);
  console.log("-----------------------------------------");
  
  if (successCount === 1 && rejectedCount === 9) {
    console.log("✅ CONCURRENCY TEST PASSED: Exactly ONE check-in successfully updated the ticket status.");
  } else {
    console.log("❌ CONCURRENCY TEST FAILED: The atomic lock did not prevent multiple successful check-ins.");
  }
  
  process.exit(0);
}

runConcurrencyTest();
