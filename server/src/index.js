import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import cycleRoutes from './routes/cycles.js';
import estimationRoutes from './routes/estimations.js';
import diseaseRoutes from './routes/disease.js';
import expenseRoutes from './routes/expenses.js';
import saleRoutes from './routes/sales.js';
import metaRoutes from './routes/meta.js';
import weatherRoutes from './routes/weather.js';
import marketPriceRoutes from './routes/marketPrices.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cycles', cycleRoutes);
// Using '/api' for these since their internal paths include '/cycles/:id/...' or similar
app.use('/api', estimationRoutes);
app.use('/api', diseaseRoutes);
app.use('/api', expenseRoutes);
app.use('/api', saleRoutes);

app.use('/api/meta', metaRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market-prices', marketPriceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
