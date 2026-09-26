import React, { useEffect, useState } from 'react';
import { getUserTickets } from '../services/api';

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const data = await getUserTickets();
      setTickets(data);
      setLoading(false);
    };
    fetchTickets();
  }, []);

  return (
    <div className="flex-1 bg-background text-text p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-secondary pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">My Tickets</h1>
          <p className="text-text-muted mt-1">Your secured digital tickets for upcoming events.</p>
        </header>

        {loading ? (
          <div className="text-center py-12 text-text-muted">Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-secondary rounded-xl">
            <p className="text-text-muted text-lg">You have no tickets yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tickets.map(ticket => (
              <div key={ticket.ticketId} className="bg-surface border border-secondary rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                <div className="bg-white p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dashed border-gray-300 min-w-[200px]">
                  {ticket.qrCode ? (
                    <img src={ticket.qrCode} alt="Ticket QR Code" className="w-40 h-40 object-contain" />
                  ) : (
                    <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">QR Error</div>
                  )}
                  <span className="mt-4 font-mono text-gray-800 text-sm font-bold tracking-wider">{ticket.ticketId}</span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Secure X Fest</h3>
                      <p className="text-primary text-sm">October 15, 2026 • 7:00 PM</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                        ticket.status === 'ISSUED' ? 'bg-success/20 text-success' : 
                        ticket.status === 'USED' ? 'bg-secondary text-text-muted' : 
                        'bg-danger/20 text-danger'
                      }`}>
                        {ticket.status}
                      </span>
                      {ticket.token && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(ticket.token);
                            alert('Token copied to clipboard!');
                          }}
                          className="text-xs bg-secondary/50 hover:bg-secondary text-text-muted hover:text-white px-2 py-1 rounded transition-colors"
                        >
                          Copy Validation Token
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-auto">
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
        )}
      </div>
    </div>
  );
}
