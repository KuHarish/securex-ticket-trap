import React, { useState } from 'react';
import { mockEvent, mockSeats } from '../data/mockData';
import { EventDetails } from '../components/EventDetails';
import { SeatMap } from '../components/SeatMap';
import { BookingSummary } from '../components/BookingSummary';
import { BookingReview } from '../components/BookingReview';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { bookTickets } from '../services/api';

type Step = 'select' | 'review' | 'confirmation';

export default function EventPage() {
  const [step, setStep] = useState<Step>('select');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

  const handleSeatToggle = (seatId: string) => {
    setError(null);
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= mockEvent.purchaseLimit) {
        setError(`You can only select a maximum of ${mockEvent.purchaseLimit} tickets.`);
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleContinueToReview = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    setStep('review');
    setError(null);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response: any = await bookTickets({
        eventId: mockEvent.id,
        seats: selectedSeats,
        quantity: selectedSeats.length,
        totalAmount: selectedSeats.length * mockEvent.ticketPrice,
      });
      
      setBookingConfirmation(response);
      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-background text-text p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b border-secondary pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Ticket Trap</h1>
          <p className="text-text-muted mt-1">Secure booking. Fair allocation.</p>
        </header>

        {error && (
          <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {step === 'select' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <EventDetails event={mockEvent} />
              <div className="bg-surface rounded-lg p-6 border border-secondary">
                <h3 className="text-xl font-semibold mb-6 border-b border-secondary pb-4">Select Tickets</h3>
                <SeatMap 
                  seats={mockSeats} 
                  selectedSeats={selectedSeats} 
                  onSeatToggle={handleSeatToggle} 
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <BookingSummary 
                event={mockEvent} 
                selectedSeats={selectedSeats} 
                onContinue={handleContinueToReview}
              />
            </div>
          </div>
        )}

        {step === 'review' && (
          <BookingReview 
            event={mockEvent}
            selectedSeats={selectedSeats}
            onEdit={() => setStep('select')}
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'confirmation' && bookingConfirmation && (
          <ConfirmationCard 
            bookingId={bookingConfirmation.bookingId}
            event={mockEvent}
            selectedSeats={selectedSeats}
          />
        )}
      </div>
    </div>
  );
}
