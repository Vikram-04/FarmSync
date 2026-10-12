import express from 'express';
import { getCurrentPrice, getMonthlyPrices, getAveragePrice } from '../services/marketPriceService.js';

const router = express.Router();

// GET /api/market-prices/current?crop=...&mandi=...
router.get('/current', (req, res) => {
  const { crop, mandi } = req.query;
  if (!crop || !mandi) {
    return res.status(400).json({ message: 'Crop and mandi are required' });
  }
  const data = getCurrentPrice(crop, mandi);
  res.json(data);
});

// GET /api/market-prices/month?crop=...&mandi=...
router.get('/month', (req, res) => {
  const { crop, mandi } = req.query;
  if (!crop || !mandi) {
    return res.status(400).json({ message: 'Crop and mandi are required' });
  }
  const data = getMonthlyPrices(crop, mandi);
  res.json(data);
});

// GET /api/market-prices/average?crop=...&mandi=...&month=...
router.get('/average', (req, res) => {
  const { crop, mandi, month } = req.query;
  if (!crop || !mandi) {
    return res.status(400).json({ message: 'Crop and mandi are required' });
  }
  const price = getAveragePrice(crop, mandi, month);
  res.json({ price, crop, mandi, month });
});

export default router;
