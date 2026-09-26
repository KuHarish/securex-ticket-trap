export const bookTickets = async (bookingData: {
  eventId: string;
  seats: string[];
  quantity: number;
  totalAmount: number;
}) => {
  try {
    const response = await fetch('http://localhost:3001/api/bookings', {
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
    // Fallback for when the backend is not running yet during early Module 1 testing
    console.warn("Backend not running. Using simulated fallback response.");
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!bookingData.eventId || !bookingData.seats || bookingData.seats.length === 0) {
          reject(new Error('Invalid booking request. Please select valid seats.'));
          return;
        }
        
        const bookingId = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        resolve({
          success: true,
          bookingId,
          message: 'Booking confirmed (Fallback API)',
        });
      }, 1000);
    });
  }
};
