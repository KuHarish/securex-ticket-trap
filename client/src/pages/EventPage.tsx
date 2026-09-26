import React, { useState, useEffect, useCallback } from 'react';
import { mockEvent, mockSeats as initialMockSeats } from '../data/mockData';
import { EventDetails } from '../components/EventDetails';
import { SeatMap } from '../components/SeatMap';
import { BookingSummary } from '../components/BookingSummary';
import { BookingReview } from '../components/BookingReview';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { bookTickets, getUserStatus, getSeats, reserveTickets, releaseTickets } from '../services/api';
import { User, PurchaseSummary, Seat } from '../types';

import { useLiveSeats } from '../hooks/useLiveSeats';

type Step = 'select' | 'review' | 'confirmation';

export default function EventPage() {
  const [step, setStep] = useState<Step>('select');
  const [seats, setSeats] = useState<Seat[]>(initialMockSeats);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);
  const [currentReservationId, setCurrentReservationId] = useState<string | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummary | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const fetchLiveSeats = useCallback(async () => {
    const liveSeats = await getSeats(mockEvent.id);
    if (liveSeats) {
      setSeats(liveSeats);
      // Remove any selected seats that are now sold/reserved
      setSelectedSeats(prev => prev.filter(id => {
         const seat = liveSeats.find((s: Seat) => s.id === id);
         return seat && seat.status === 'AVAILABLE';
      }));
    }
  }, []);

  const { liveStatus } = useLiveSeats(mockEvent.id, fetchLiveSeats);

  useEffect(() => {
    const handleLiveSeatUpdate = (e: any) => {
      const data = e.detail;
      if (data.type === 'SEAT_STATE') {
        setSeats(data.seats);
        setSelectedSeats(prev => prev.filter(id => {
          const seat = data.seats.find((s: Seat) => s.id === id);
          return seat && seat.status === 'AVAILABLE';
        }));
      } else if (data.type === 'SEAT_UPDATED') {
        setSeats(prev => prev.map(s => s.id === data.seatId ? { ...s, status: data.status } : s));
        if (data.status !== 'AVAILABLE') {
          setSelectedSeats(prev => prev.filter(id => id !== data.seatId));
        }
      }
    };
    window.addEventListener('live-seat-update', handleLiveSeatUpdate);
    return () => window.removeEventListener('live-seat-update', handleLiveSeatUpdate);
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getUserStatus(mockEvent.id);
        setUser(data.user);
        setPurchaseSummary(data.purchaseSummary);
      } catch (err) {
        console.error("Failed to fetch user status", err);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
    // fetchLiveSeats(); // Commented out since WS will fetch initial state, but fallback to hook handles it
  }, []);

  const handleSeatToggle = (seatId: string) => {
    setError(null);
    if (!purchaseSummary) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      
      if (purchaseSummary.purchased >= purchaseSummary.limit) {
        setError(`You have reached your maximum ticket limit of ${purchaseSummary.limit}.`);
        return prev;
      }
      
      if (prev.length >= purchaseSummary.remaining) {
        setError(`You can purchase only ${purchaseSummary.remaining} more ticket(s).`);
        return prev;
      }
      
      return [...prev, seatId];
    });
  };

  const handleContinueToReview = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await reserveTickets(mockEvent.id, selectedSeats);
      setCurrentReservationId(res.reservationId);
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Selected seats are no longer available. Please choose others.');
      await fetchLiveSeats();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReview = async () => {
    setStep('select');
    setError(null);
    if (currentReservationId) {
      try {
        await releaseTickets(mockEvent.id, selectedSeats);
        setCurrentReservationId(null);
      } catch (e) {
        console.error("Failed to release tickets", e);
      }
    }
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response: any = await bookTickets({
        eventId: mockEvent.id,
        ticketIds: selectedSeats,
        ...(currentReservationId ? { reservationId: currentReservationId } : {})
      });
      
      setBookingConfirmation(response);
      setPurchaseSummary(response.purchaseSummary);
      setStep('confirmation');
      await fetchLiveSeats(); // Refresh seats after successful booking
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking. Please try again.');
      setStep('select');
      await fetchLiveSeats(); // Refresh seats to show what became unavailable
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex-1 bg-background text-text flex items-center justify-center p-8 min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-text-muted">Loading event access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-text p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b border-secondary pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ticket Trap</h1>
            <p className="text-text-muted mt-1">Secure booking. Fair allocation.</p>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${liveStatus === 'live' ? 'bg-green-500 animate-pulse' : liveStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
              <span className="text-text-muted">
                {liveStatus === 'live' ? 'Live updates connected' : liveStatus === 'connecting' ? 'Connecting...' : 'Live updates disconnected'}
              </span>
            </div>
            {user && (
              <div className="text-right">
                <span className="text-text-muted">Signed in as </span>
                <span className="font-semibold text-white">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {step === 'select' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <EventDetails event={mockEvent} purchaseSummary={purchaseSummary} />
              <div className="bg-surface rounded-lg p-6 border border-secondary">
                <div className="flex justify-between items-center border-b border-secondary pb-4 mb-6">
                  <h3 className="text-xl font-semibold">Select Tickets</h3>
                  <button onClick={fetchLiveSeats} className="text-xs px-3 py-1 bg-secondary text-white rounded hover:bg-secondary/80">Refresh Status</button>
                </div>
                <SeatMap 
                  seats={seats} 
                  selectedSeats={selectedSeats} 
                  onSeatToggle={handleSeatToggle} 
                />
              </div>
            </div>
            <div className="lg:col-span-1">
              <BookingSummary 
                event={mockEvent} 
                selectedSeats={selectedSeats} 
                purchaseSummary={purchaseSummary}
                onContinue={handleContinueToReview}
              />
            </div>
          </div>
        )}

        {step === 'review' && (
          <BookingReview 
            event={mockEvent}
            selectedSeats={selectedSeats}
            onEdit={handleCancelReview}
            onConfirm={handleConfirmBooking}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'confirmation' && bookingConfirmation && (
          <ConfirmationCard 
            bookingId={bookingConfirmation.booking.bookingId}
            event={mockEvent}
            selectedSeats={selectedSeats}
          />
        )}
      </div>
    </div>
  );
}
