# Ticket Trap

Secure High-Concurrency Ticket Booking System

## Problem
High-demand ticket systems can suffer from overselling, duplicate reservations, ticket manipulation, and automated abuse (bots). 

## Solution
Ticket Trap is designed from the ground up with security and fair allocation in mind. The backend acts as the authoritative source of truth.

### Key Security Features:
- **Atomic Booking (Anti-Overselling):** Redis atomic locks prevent two users from successfully reserving the same seat, even under massive concurrent load.
- **Purchase Limits:** Server-side validation restricts users to a maximum of 2 tickets.
- **Real-Time Sync:** WebSockets instantly update seat availability across all active clients to provide a fair user experience.
- **Secure QR Tickets:** Generated tickets contain cryptographically signed data.
- **Tamper Detection:** Modified ticket data fails server-side signature verification.
- **Anti-Reuse:** Checked-in tickets are tracked in Redis and cannot be scanned a second time.
- **Anti-Abuse & Rate Limiting:** Redis-based throttling detects excessive repeated requests and temporarily blocks abusive IP addresses or user identities.

## Tech Stack
- **Frontend:** React.js, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database/State:** Redis
- **Real-Time:** WebSockets (`ws`)
- **Security:** Node.js Crypto API
- **QR:** `qrcode` package

## Setup

1. **Install Dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` in the `server` directory (if not already done). The server will use sensible fallbacks for the demo if `.env` is missing.

3. **Start Redis**
   Make sure Redis is running on `localhost:6379`.
   *(If using Windows, you can run Redis via WSL or Docker).*

4. **Run the Application**
   Start Backend:
   ```bash
   cd server
   npm run dev
   ```
   Start Frontend:
   ```bash
   cd client
   npm run dev
   ```

## Demo Flow (5-10 Minutes)

Use this exact sequence for a flawless competition demonstration:

1. **Normal Booking & Architecture**
   - Open the application. Select "Event".
   - Show the seat map. Explain the 2-ticket purchase limit.
   - Select 2 seats and click "Continue". 
   - Click "Confirm Booking". Show the successful generation of a Secure QR Ticket.

2. **Real-Time Seat Synchronization & Atomic Lock**
   - Open **two browser windows** side by side.
   - In Window A, select an available seat (e.g., A1) and click "Continue".
   - Watch Window B instantly update A1 to orange (RESERVED) without refreshing!
   - In Window A, click "Back to seat selection". Watch Window B instantly revert A1 to grey (AVAILABLE).
   - *This demonstrates atomic locks and real-time state synchronization.*

3. **Tamper Detection (Validator)**
   - Go to "My Tickets" and copy a valid validation token.
   - Go to "Validator" and paste it. Click Validate. It shows **✓ TICKET VALID**.
   - Modify one character of the token (e.g., change an 'a' to a 'b' at the end) and click Validate again.
   - It will show **✗ TICKET TAMPERED**. The server detected the cryptographic signature mismatch.

4. **Ticket Reuse Prevention (Check-In)**
   - Paste the original, unmodified token again.
   - Click **"CHECK IN NOW"**. It shows **✓ CHECK-IN SUCCESSFUL**.
   - Click Validate again. It shows **✗ ALREADY USED**.

5. **Rate Limiting / Anti-Abuse (Security Monitor)**
   - Go to the "Security Monitor" page to show the live security dashboard tracking all the previous events!

> **Security Note:**
> Cryptographic signatures detect unauthorized ticket modifications but do not make tickets absolutely impossible to clone visually. Production deployments would require dynamic QR rotation or scanning at gates to prevent screenshot sharing.
