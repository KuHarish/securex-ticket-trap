const API_URL = 'http://localhost:3001/api/bookings';

async function testAbuseProtection() {
  console.log("=========================================");
  console.log("TICKET TRAP - ABUSE PROTECTION TEST");
  console.log("=========================================\n");

  const payload1 = {
    eventId: "EVT-001",
    ticketIds: ["F1"] // Unbooked seat
  };

  const payload2 = {
    eventId: "EVT-001",
    ticketIds: ["F2"] // Another unbooked seat
  };

  // TEST 1: Normal Request
  console.log("TEST 1: Normal Booking Request");
  const res1 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload1)
  });
  console.log(`Response 1: ${res1.status} - ${(await res1.json()).error || 'SUCCESS'}\n`);

  // TEST 2: Duplicate Request (Immediately sending same payload)
  console.log("TEST 2: Duplicate Booking Request");
  const res2 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload1)
  });
  const data2 = await res2.json();
  console.log(`Response 2: ${res2.status} - ${data2.error} - ${data2.message}\n`);

  // TEST 3: Rate Limiting (Sending many fast requests)
  console.log("TEST 3: Rapid Fire Booking Attempts (Rate Limit Check)");
  let rateLimited = false;
  for (let i = 0; i < 7; i++) {
    // Generate slightly different payload so it's not caught by DUPLICATE_REQUEST
    const p = { eventId: "EVT-001", ticketIds: [`G${i}`] };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    const d = await res.json();
    if (res.status === 429 && d.error === 'RATE_LIMITED') {
      rateLimited = true;
      console.log(`Request ${i + 3} rate limited: ${d.message}`);
    }
  }

  // TEST 4: Abuse Block
  console.log("\nTEST 4: Temporary Throttling (Abuse Block)");
  const resBlock = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload2)
  });
  const dataBlock = await resBlock.json();
  console.log(`Response: ${resBlock.status} - ${dataBlock.error} - ${dataBlock.message}\n`);

  console.log("-----------------------------------------");
  console.log("Test Complete.");
  console.log(`Duplicate Detected: ${data2.error === 'DUPLICATE_REQUEST' ? '✅' : '❌'}`);
  console.log(`Rate Limiting Triggered: ${rateLimited ? '✅' : '❌'}`);
  console.log(`Temporary Throttling Engaged: ${dataBlock.error === 'TEMPORARILY_THROTTLED' ? '✅' : '❌'}`);
  console.log("-----------------------------------------");
}

testAbuseProtection();
