import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';

const app = express();

app.set('trust proxy', 1); // Ensures req.ip works behind Render's load balancer
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/monitor', monitorRoutes);

export default app;
