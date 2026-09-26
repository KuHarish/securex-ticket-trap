// Mock booking controller for Module 1
export const createBooking = (req, res) => {
  const { eventId, seats, quantity, totalAmount } = req.body;

  // Basic mock validation
  if (!eventId || !seats || !Array.isArray(seats) || seats.length === 0 || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking request. Please select valid seats.',
    });
  }

  // Simulate network delay
  setTimeout(() => {
    // Generate a mock booking ID
    const bookingId = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return res.status(200).json({
      success: true,
      bookingId,
      message: 'Booking confirmed',
      data: {
        eventId,
        seats,
        quantity,
        totalAmount,
      }
    });
  }, 1000);
};
