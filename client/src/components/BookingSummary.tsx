import React from 'react';
import { EventDetails } from '../types';
import { Ticket } from 'lucide-react';

interface Props {
  event: EventDetails;
  selectedSeats: string[];
  onContinue: () => void;
}

export function BookingSummary({ event, selectedSeats, onContinue }: Props) {
  const quantity = selectedSeats.length;
  const totalAmount = quantity * event.ticketPrice;
  const remaining = event.purchaseLimit - quantity;

  return (
    <div className="bg-surface rounded-lg p-6 border border-secondary sticky top-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
        <Ticket className="text-primary" />
        <span>Booking Summary</span>
      </h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Selected</span>
          <span className="font-medium text-white">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Tickets</span>
          <span className="font-medium text-white">{quantity}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Price</span>
          <span className="font-medium text-white">₹{event.ticketPrice}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Maximum</span>
          <span className="font-medium text-white">{event.purchaseLimit} tickets</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Remaining</span>
          <span className={`font-medium ${remaining === 0 ? 'text-danger' : 'text-success'}`}>
            {remaining}
          </span>
        </div>

        <div className="flex justify-between items-center py-4 text-lg">
          <span className="font-semibold text-white">Total</span>
          <span className="font-bold text-primary">₹{totalAmount}</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        disabled={quantity === 0}
        className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
          quantity === 0 
            ? 'bg-secondary cursor-not-allowed opacity-50' 
            : 'bg-primary hover:bg-primary-hover shadow-lg hover:shadow-primary/25'
        }`}
      >
        Continue to Review
      </button>
    </div>
  );
}
