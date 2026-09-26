import fetch from 'node-fetch'; // or use native fetch if node 18+

const API_URL = 'http://localhost:3001/api/bookings';

const makeRequest = async (requestId) => {
  try {
    const start = Date.now();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'EVT-001',
        ticketIds: ['A1'] // all fighting for A1
      })
    });
    const data = await res.json();
    const elapsed = Date.now() - start;
    
    if (data.success) {
      console.log(`[Request ${requestId}] SUCCESS in ${elapsed}ms: Booking ID ${data.booking.bookingId}`);
    } else {
      console.log(`[Request ${requestId}] REJECTED in ${elapsed}ms: ${data.error} - ${data.message}`);
    }
    return data;
  } catch (err) {
    console.error(`[Request ${requestId}] FAILED: ${err.message}`);
    return null;
  }
};

const runConcurrencyTest = async () => {
  console.log("Starting concurrency test for ticket A1...");
  const CONCURRENT_REQUESTS = 10;
  
  const promises = [];
  for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
    promises.push(makeRequest(i));
  }
  
  const results = await Promise.all(promises);
  
  const successes = results.filter(r => r && r.success).length;
  const rejections = results.filter(r => r && !r.success).length;
  
  console.log("-----------------------------------------");
  console.log(`Test Complete.`);
  console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Successful Bookings: ${successes} (Expected: 1)`);
  console.log(`Rejected Bookings: ${rejections} (Expected: 9)`);
  console.log("-----------------------------------------");
  
  if (successes === 1) {
    console.log("✅ CONCURRENCY TEST PASSED: Exactly ONE request successfully reserved the ticket.");
  } else {
    console.log("❌ CONCURRENCY TEST FAILED: The atomic lock did not prevent multiple successful reservations.");
  }
};

runConcurrencyTest();
