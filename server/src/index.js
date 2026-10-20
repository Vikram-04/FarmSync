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
import metaRoutes from './routes/meta.js';
import cycleDataRoutes from './routes/cycleData.js';
import diseaseRoutes from './routes/disease.js';
import expenseRoutes from './routes/expenses.js';
import saleRoutes from './routes/sales.js';
import { updateAllCyclePrices } from './services/priceService.js';
import cron from 'node-cron';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const clientDist = path.join(__dirname, '../dist');
app.use(express.static(clientDist));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api', cycleDataRoutes);
app.use('/api', diseaseRoutes);
app.use('/api', expenseRoutes);
app.use('/api', saleRoutes);
app.use('/api/cycles', cycleRoutes);

cron.schedule('0 18 * * *', () => updateAllCyclePrices(), { timezone: 'Asia/Kolkata' });

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || path.extname(req.path)) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
