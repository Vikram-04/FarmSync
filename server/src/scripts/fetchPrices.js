import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { updateAllCyclePrices } from '../services/priceService.js';

dotenv.config();
await connectDB();
try {
  await updateAllCyclePrices();
} finally {
  process.exit(0);
}
