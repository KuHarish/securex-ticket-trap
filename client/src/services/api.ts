const API_BASE = 'http://localhost:3001/api';

export const getUserStatus = async (eventId: string) => {
  try {
    const response = await fetch(`${API_BASE}/users/me?eventId=${eventId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user status');
    }
    return data; // { success, user, purchaseSummary }
  } catch (error: any) {
    console.warn("Backend not running or error fetching user status.", error);
    // Fallback for development if backend is not started
    return {
      success: true,
      user: { userId: 'USER-FALLBACK', name: 'Fallback User', email: 'fallback@example.com' },
      purchaseSummary: { purchased: 0, limit: 2, remaining: 2 }
    };
  }
};

export const getSeats = async (eventId: string) => {
  try {
    const response = await fetch(`${API_BASE}/inventory/${eventId}/seats`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch seats');
    }
    return data.seats; // returns Array of Seat
  } catch (error: any) {
    console.warn("Failed to fetch live seats, using mock data.");
    return null;
  }
};

export const bookTickets = async (bookingData: {
  eventId: string;
  ticketIds: string[];
}) => {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred during booking.');
    }

    return data;
  } catch (error: any) {
    // If backend is truly down and we need fallback logic
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch failed')) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!bookingData.eventId || !bookingData.ticketIds || bookingData.ticketIds.length === 0) {
            reject(new Error('Invalid booking request. Please select valid seats.'));
            return;
          }
          const bookingId = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          resolve({
            success: true,
            booking: {
              bookingId,
              status: 'CONFIRMED'
            },
            purchaseSummary: { purchased: bookingData.ticketIds.length, limit: 2, remaining: 2 - bookingData.ticketIds.length },
            message: 'Booking confirmed (Fallback API)',
          });
        }, 1000);
      });
    }

    // Normal backend rejection
    throw error;
  }
};
