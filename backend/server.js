import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rfidRoutes from './routes/rfid.js';
import otpRoutes from './routes/otp.js';
import accessRoutes from './routes/access.js';
import esp32Routes from './routes/esp32.js';
import wokwiRoutes from './routes/wokwi.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/rfid', rfidRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/esp32', esp32Routes);
// Route tương thích với code Wokwi hiện tại
app.use('/api', wokwiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

