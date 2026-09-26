import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export function ValidatorPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/tickets/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, status: 'ERROR', message: 'Failed to connect to validation server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!token.trim() || !result?.valid) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/tickets/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });
      const data = await response.json();
      setResult(data); // Will update to CHECKIN_SUCCESS or ALREADY_USED
    } catch (err) {
      setResult({ valid: false, status: 'ERROR', message: 'Failed to perform check-in.' });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const { status, message, ticket } = result;

    if (status === 'VALID') {
      return (
        <div className="bg-success/10 border border-success rounded-lg p-6 mt-6">
          <div className="flex items-center space-x-3 text-success mb-4">
            <CheckCircle size={28} />
            <h2 className="text-2xl font-bold">✓ TICKET VALID</h2>
          </div>
          <p className="text-text-muted mb-4">{message}</p>
          
          <div className="bg-surface p-4 rounded mb-6 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-text-muted uppercase block">Ticket ID</span>
              <span className="font-mono text-white">{ticket.ticketId}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase block">Seat</span>
              <span className="font-bold text-white text-lg">{ticket.seatId}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase block">Event</span>
              <span className="font-medium text-white">{ticket.eventId}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckIn}
            className="w-full bg-success hover:bg-success/90 text-white py-3 rounded font-bold transition-colors"
          >
            CHECK IN NOW
          </button>
        </div>
      );
    }

    if (status === 'CHECKIN_SUCCESS') {
      return (
        <div className="bg-success/20 border border-success rounded-lg p-6 mt-6 text-center">
          <CheckCircle size={48} className="text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-success mb-2">CHECK-IN SUCCESSFUL</h2>
          <p className="text-white">Ticket <span className="font-mono">{ticket.ticketId}</span> has been marked as USED.</p>
        </div>
      );
    }

    if (status === 'TAMPERED') {
      return (
        <div className="bg-error/10 border border-error rounded-lg p-6 mt-6">
          <div className="flex items-center space-x-3 text-error mb-2">
            <AlertTriangle size={28} />
            <h2 className="text-2xl font-bold">✗ TICKET TAMPERED</h2>
          </div>
          <p className="text-red-300 font-medium">{message}</p>
        </div>
      );
    }

    if (status === 'ALREADY_USED') {
      return (
        <div className="bg-warning/10 border border-warning rounded-lg p-6 mt-6">
          <div className="flex items-center space-x-3 text-warning mb-2">
            <XCircle size={28} />
            <h2 className="text-2xl font-bold">✗ ALREADY USED</h2>
          </div>
          <p className="text-yellow-200 font-medium">{message}</p>
        </div>
      );
    }

    return (
      <div className="bg-surface border border-secondary rounded-lg p-6 mt-6">
        <div className="flex items-center space-x-3 text-red-400 mb-2">
          <XCircle size={28} />
          <h2 className="text-2xl font-bold">✗ {status.replace('_', ' ')}</h2>
        </div>
        <p className="text-text-muted">{message}</p>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex items-center justify-center space-x-3 mb-8">
        <ShieldCheck size={36} className="text-primary" />
        <h1 className="text-3xl font-bold text-white">Ticket Validator</h1>
      </div>

      <div className="bg-background border border-secondary p-8 rounded-xl shadow-xl">
        <p className="text-text-muted mb-4">Paste the digital ticket token below to verify its cryptographic integrity and check it in.</p>
        
        <textarea 
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste secure ticket token here..."
          className="w-full h-32 bg-surface border border-secondary text-white p-4 rounded focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm resize-none mb-4"
        />

        <button 
          onClick={handleValidate}
          disabled={loading || !token.trim()}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded font-bold text-lg transition-colors"
        >
          {loading ? 'Validating...' : 'Validate Ticket'}
        </button>

        {renderResult()}
      </div>
    </div>
  );
}
