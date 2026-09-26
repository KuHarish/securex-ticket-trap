import { useState, useEffect, useCallback, useRef } from 'react';
import { Seat } from '../types';

export function useLiveSeats(eventId: string, fallbackFetch: () => Promise<void>) {
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'live' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setLiveStatus('connecting');
    // Use environment variable for production, fallback to local for development
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:3001';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setLiveStatus('live');
      ws.send(JSON.stringify({ type: 'SUBSCRIBE_EVENT', eventId }));

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING' }));
        }
      }, 15000); // 15s ping
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SEAT_STATE' || data.type === 'SEAT_UPDATED') {
          // We will dispatch a custom event to the window so EventPage can update without full re-render of this hook
          const customEvent = new CustomEvent('live-seat-update', { detail: data });
          window.dispatchEvent(customEvent);
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.onclose = (event) => {
      console.warn('WS Closed', event.code, event.reason);
      setLiveStatus('disconnected');
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      
      // Auto-reconnect backoff
      setTimeout(() => {
        fallbackFetch();
        connect();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WS Error:', error);
      ws.close();
    };
  }, [eventId, fallbackFetch]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [connect]);

  return { liveStatus };
}
