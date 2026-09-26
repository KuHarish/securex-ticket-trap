import React, { useState } from 'react';
import { EventDetails } from '../types';
import { CheckCircle2, QrCode, ArrowLeft } from 'lucide-react';
import { getDigitalTickets } from '../services/api';

interface Props {
  bookingId: string;
  event: EventDetails;
  selectedSeats: string[];
}

export function ConfirmationCard({ bookingId, event, selectedSeats }: Props) {
  const quantity = selectedSeats.length;
  const totalAmount = quantity * event.ticketPrice;

  const [viewTickets, setViewTickets] = useState(false);
  const [digitalTickets, setDigitalTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewTickets = async () => {
    setViewTickets(true);
    if (digitalTickets.length > 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const tickets = await getDigitalTickets(bookingId);
      setDigitalTickets(tickets);
    } catch (err: any) {
      setError(err.message || 'Failed to load digital tickets');
    } finally {
      setLoading(false);
    }
  };

  if (viewTickets) {
    return (
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => setViewTickets(false)}
          className="flex items-center space-x-2 text-text-muted hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Summary</span>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Your Digital Tickets</h2>

        {loading && <div className="text-center py-8 text-text-muted">Generating secure tickets...</div>}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {!loading && !error && digitalTickets.map((ticket, index) => (
          <div key={ticket.ticketId} className="bg-surface border border-secondary rounded-xl mb-6 overflow-hidden flex flex-col md:flex-row shadow-lg">
            {/* Left side: QR Code */}
            <div className="bg-white p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dashed border-gray-300 min-w-[200px]">
              {ticket.qrCode ? (
                <img src={ticket.qrCode} alt="Ticket QR Code" className="w-40 h-40 object-contain" />
              ) : (
                <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">QR Error</div>
              )}
              <span className="mt-4 font-mono text-gray-800 text-sm font-bold tracking-wider">{ticket.ticketId}</span>
            </div>
            
            {/* Right side: Ticket Info */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{event.name}</h3>
                  <p className="text-primary text-sm">{event.date} • {event.time}</p>
                </div>
                <span className="bg-success/20 text-success text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                  {ticket.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div>
                  <span className="text-xs text-text-muted uppercase block">Venue</span>
                  <span className="font-medium text-white">{event.venue}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted uppercase block">Seat</span>
                  <span className="font-bold text-white text-lg">{ticket.seatId}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted uppercase block">Booking Ref</span>
                  <span className="font-mono text-white text-sm">{ticket.bookingId}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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

        <div className="mt-10 flex">
          <button 
            onClick={handleViewTickets}
            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
          >
            <QrCode size={20} />
            <span>View Digital Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
}
