import React from 'react';
import { EventDetails as EventDetailsType, PurchaseSummary } from '../types';
import { Ticket, AlertCircle } from 'lucide-react';

interface Props {
  event: EventDetailsType;
  selectedSeats: string[];
  purchaseSummary: PurchaseSummary | null;
  onContinue: () => void;
}

export function BookingSummary({ event, selectedSeats, purchaseSummary, onContinue }: Props) {
  const quantity = selectedSeats.length;
  const totalAmount = quantity * event.ticketPrice;
  
  // Calculate remaining taking into account already purchased AND currently selected
  const limit = purchaseSummary?.limit || event.purchaseLimit;
  const alreadyPurchased = purchaseSummary?.purchased || 0;
  const dynamicallyRemaining = limit - alreadyPurchased - quantity;
  
  const isLimitExceeded = dynamicallyRemaining < 0;

  return (
    <div className="bg-surface rounded-lg p-6 border border-secondary sticky top-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
        <Ticket className="text-primary" />
        <span>Booking Summary</span>
      </h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Selected</span>
          <span className="font-medium text-white text-right">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">New Tickets</span>
          <span className="font-medium text-white">{quantity}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-secondary">
          <span className="text-text-muted">Price</span>
          <span className="font-medium text-white">₹{event.ticketPrice}</span>
        </div>

        {purchaseSummary && (
          <div className="py-3 px-4 bg-background border border-secondary rounded-md mt-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-text-muted">Your Allowance</span>
              <span className="font-medium text-white">{alreadyPurchased} / {limit} Used</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Remaining allowed</span>
              <span className={`font-medium ${dynamicallyRemaining === 0 ? 'text-primary' : dynamicallyRemaining < 0 ? 'text-danger' : 'text-success'}`}>
                {dynamicallyRemaining}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center py-4 text-lg">
          <span className="font-semibold text-white">Total</span>
          <span className="font-bold text-primary">₹{totalAmount}</span>
        </div>
      </div>
      
      {isLimitExceeded && (
        <div className="mb-4 text-sm text-danger flex items-start space-x-2 bg-danger/10 p-3 rounded border border-danger/20">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>This selection exceeds your remaining ticket allowance.</span>
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={quantity === 0 || isLimitExceeded}
        className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
          quantity === 0 || isLimitExceeded
            ? 'bg-secondary cursor-not-allowed opacity-50' 
            : 'bg-primary hover:bg-primary-hover shadow-lg hover:shadow-primary/25'
        }`}
      >
        Continue to Review
      </button>
    </div>
  );
}
