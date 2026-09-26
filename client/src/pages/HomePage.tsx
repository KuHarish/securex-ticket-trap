import React from 'react';
import { Shield, Ticket, Zap, Lock } from 'lucide-react';

interface Props {
  onNavigate: (mode: 'event' | 'validator') => void;
}

export function HomePage({ onNavigate }: Props) {
  return (
    <div className="flex-1 bg-background text-text flex flex-col items-center justify-center p-8 min-h-screen">
      <div className="max-w-4xl w-full space-y-12 text-center">
        
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4">
            <Shield size={48} className="text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
            Ticket Trap
          </h1>
          <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto">
            Secure High-Concurrency Ticket Booking
          </p>
          <p className="text-text-muted/80 max-w-3xl mx-auto mt-4 leading-relaxed">
            Secure ticket booking designed to prevent duplicate reservations, ticket-limit bypassing, overselling, ticket tampering, and automated abuse.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8">
          <button
            onClick={() => onNavigate('event')}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            <Ticket size={24} />
            <span>BOOK TICKETS</span>
          </button>
          
          <button
            onClick={() => onNavigate('validator')}
            className="flex items-center space-x-2 bg-surface border-2 border-secondary hover:border-primary text-white px-8 py-4 rounded-lg font-bold text-lg transition-all w-full sm:w-auto justify-center"
          >
            <Shield size={24} />
            <span>VALIDATE TICKET</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="bg-surface p-6 rounded-xl border border-secondary text-left">
            <Lock className="text-primary mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Atomic Booking</h3>
            <p className="text-sm text-text-muted">Redis-backed atomic locks ensure no two users can double-book the same seat.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-secondary text-left">
            <Zap className="text-success mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Sync</h3>
            <p className="text-sm text-text-muted">WebSockets instantly update seat availability across all active clients.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-secondary text-left">
            <Shield className="text-danger mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Anti-Abuse</h3>
            <p className="text-sm text-text-muted">Rate limiting and cryptographic verification detect and reject suspicious activity.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
