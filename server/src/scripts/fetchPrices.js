import 'dotenv/config';
import connectDB from '../config/db.js';
import { updateAllCyclePrices } from '../services/priceService.js';

let exitCode = 0;
try {
  await connectDB();
  await updateAllCyclePrices();
} catch (error) {
  console.error('fetch-prices failed:', error);
  exitCode = 1;
} finally {
  process.exit(exitCode);
}