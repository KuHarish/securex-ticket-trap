import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

export default app;
