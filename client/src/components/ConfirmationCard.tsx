import React from 'react';
import { EventDetails } from '../types';
import { CheckCircle2, Download, Share2 } from 'lucide-react';

interface Props {
  bookingId: string;
  event: EventDetails;
  selectedSeats: string[];
}

export function ConfirmationCard({ bookingId, event, selectedSeats }: Props) {
  const quantity = selectedSeats.length;
  const totalAmount = quantity * event.ticketPrice;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-t-xl p-8 text-center border border-b-0 border-secondary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-text-muted">Your tickets have been successfully secured.</p>
        
        <div className="mt-6 inline-block bg-background px-6 py-3 rounded-lg border border-secondary border-dashed">
          <span className="text-sm text-text-muted uppercase tracking-widest block mb-1">Booking ID</span>
          <span className="text-2xl font-mono font-bold text-white tracking-wider">{bookingId}</span>
        </div>
      </div>

      <div className="bg-background p-8 border border-secondary rounded-b-xl relative">
        <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border-r border-b border-secondary transform rotate-45"></div>
        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border-l border-b border-secondary transform -rotate-45"></div>
        
        <div className="border-t border-secondary border-dashed absolute top-0 left-6 right-6"></div>

        <div className="space-y-6 mt-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
            <p className="text-text-muted">{event.date} • {event.time}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Venue</span>
              <span className="font-medium text-white">{event.venue}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Location</span>
              <span className="font-medium text-white">{event.location}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Seats ({quantity})</span>
              <span className="font-medium text-white">{selectedSeats.join(', ')}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Total Paid</span>
              <span className="font-bold text-primary text-lg">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex space-x-4">
          <button className="flex-1 bg-surface border border-secondary hover:border-text-muted text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2">
            <Download size={18} />
            <span>Download Ticket</span>
          </button>
          <button className="flex-1 bg-surface border border-secondary hover:border-text-muted text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2">
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
