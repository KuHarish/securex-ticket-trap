import React from 'react';
import { EventDetails } from '../types';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Props {
  event: EventDetails;
  selectedSeats: string[];
  onEdit: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function BookingReview({ event, selectedSeats, onEdit, onConfirm, isSubmitting }: Props) {
  const quantity = selectedSeats.length;
  const totalAmount = quantity * event.ticketPrice;

  return (
    <div className="max-w-2xl mx-auto bg-surface rounded-lg border border-secondary overflow-hidden">
      <div className="p-6 border-b border-secondary flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Review Booking</h2>
        <button 
          onClick={onEdit}
          disabled={isSubmitting}
          className="text-text-muted hover:text-white flex items-center space-x-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Edit Selection</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-text-muted uppercase tracking-wider">Event</span>
            <p className="font-semibold text-lg text-white">{event.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-text-muted uppercase tracking-wider">Date & Time</span>
            <p className="text-white">{event.date} • {event.time}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <span className="text-xs text-text-muted uppercase tracking-wider">Venue</span>
            <p className="text-white">{event.venue}, {event.location}</p>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-secondary mt-6">
          <h3 className="text-sm text-text-muted uppercase tracking-wider mb-4">Ticket Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Selected Seats</span>
              <span className="font-semibold text-white">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Quantity</span>
              <span className="font-medium text-white">{quantity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Price per ticket</span>
              <span className="font-medium text-white">₹{event.ticketPrice}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-secondary flex justify-between items-center">
              <span className="font-semibold text-lg text-white">Total Amount</span>
              <span className="font-bold text-2xl text-primary">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-secondary bg-background/50 flex justify-end space-x-4">
        <button
          onClick={onEdit}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-md font-medium text-text-muted hover:text-white border border-secondary hover:border-text-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-md font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg hover:shadow-primary/25 transition-all duration-200 flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              <span>Confirm Booking</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
