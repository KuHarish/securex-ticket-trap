import { WebSocketServer, WebSocket } from 'ws';
import { inventoryService } from './inventoryService.js';

// eventId -> Set of WebSockets
const eventSubscriptions = new Map();

export const wsService = {
  init(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}`);
      let currentEventId = null;
      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);

          if (data.type === 'SUBSCRIBE_EVENT') {
            const { eventId } = data;
            
            // Unsubscribe from previous if necessary
            if (currentEventId && currentEventId !== eventId) {
              const subs = eventSubscriptions.get(currentEventId);
              if (subs) subs.delete(ws);
            }

            // Subscribe to new
            currentEventId = eventId;
            if (!eventSubscriptions.has(eventId)) {
              eventSubscriptions.set(eventId, new Set());
            }
            eventSubscriptions.get(eventId).add(ws);

            // Fetch current state and send it immediately
            const seats = await inventoryService.getLiveSeats(eventId);
            
            ws.send(JSON.stringify({
              type: 'SEAT_STATE',
              eventId: eventId,
              seats: seats
            }));
            
            // Acknowledge subscription
            ws.send(JSON.stringify({
              type: 'SUBSCRIBED',
              eventId: eventId
            }));
          } else if (data.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG' }));
          }
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        if (currentEventId) {
          const subs = eventSubscriptions.get(currentEventId);
          if (subs) {
            subs.delete(ws);
            if (subs.size === 0) {
              eventSubscriptions.delete(currentEventId);
            }
          }
        }
      });
    });

    // Heartbeat to keep connections alive and clear dead ones
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  },

  broadcastSeatUpdate(eventId, seatId, status) {
    const payload = JSON.stringify({
      type: 'SEAT_UPDATED',
      eventId,
      seatId,
      status
    });

    const clients = eventSubscriptions.get(eventId);
    if (clients) {
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  },

  shutdown() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.wss) {
      this.wss.clients.forEach(ws => ws.terminate());
      this.wss.close();
    }
  }
};
