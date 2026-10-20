import express from 'express';
import auth from '../middleware/auth.js';
import CropCycle from '../models/CropCycle.js';
import MandiPrice from '../models/MandiPrice.js';
import Expense from '../models/Expense.js';
import Sale from '../models/Sale.js';
import DiseasePrediction from '../models/DiseasePrediction.js';
import { fetchWeather } from '../services/weatherService.js';
import { plantVillageCrop } from '../config/diseaseCrops.js';

const router = express.Router();
const owned = (id, userId) => CropCycle.findOne({ _id: id, userId }).populate('districtId cropId seasonId mandiId');
const stage = (cycle) => {
  const progress = (Date.now() - new Date(cycle.sowingDate).getTime()) / 86400000 / cycle.cropId.durationDays;
  if (progress < 0) return 'Not yet sown';
  if (progress < 0.15) return 'Germination';
  if (progress < 0.5) return 'Vegetative';
  if (progress < 0.75) return 'Flowering';
  if (progress < 1) return 'Maturity';
  return 'Ready to harvest';
};
const latestPrice = (cycle) => MandiPrice.findOne({ mandiId: cycle.mandiId._id, cropId: cycle.cropId._id }).sort({ fetchDate: -1 });

router.get('/cycles/:id/estimate', auth, async (req, res) => {
  const cycle = await owned(req.params.id, req.user._id);
  if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
  const price = await latestPrice(cycle);
  const predictedProduction = cycle.predictedYield * cycle.areaHectares;
  res.json({ predictedYield: cycle.predictedYield, areaHectares: cycle.areaHectares, predictedProduction, currentPrice: price?.price ?? null, arrivalDate: price?.arrivalDate ?? null, currentRevenue: price ? predictedProduction * 10 * price.price : null });
});

router.get('/cycles/:id/price-history', auth, async (req, res) => {
  const cycle = await owned(req.params.id, req.user._id);
  if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
  const start = new Date(cycle.createdAt).toISOString().slice(0, 10);
  res.json(await MandiPrice.find({ mandiId: cycle.mandiId._id, cropId: cycle.cropId._id, fetchDate: { $gte: start } }).sort({ fetchDate: 1 }).lean());
});

router.get('/cycles/:id/weather', auth, async (req, res) => {
  const cycle = await owned(req.params.id, req.user._id);
  if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
  res.json(await fetchWeather(cycle.districtId.lat, cycle.districtId.lon));
});

router.get('/cycles/:id/finance-summary', auth, async (req, res) => {
  const cycle = await owned(req.params.id, req.user._id);
  if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
  const [expenses, sales] = await Promise.all([Expense.find({ cycleId: cycle._id }).lean(), Sale.find({ cycleId: cycle._id }).lean()]);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSales = sales.reduce((sum, item) => sum + item.totalAmount, 0);
  const expensesByCategory = expenses.reduce((result, item) => ({ ...result, [item.category]: (result[item.category] || 0) + item.amount }), {});
  res.json({ expensesByCategory, totalExpenses, totalSales, actualProfit: totalSales - totalExpenses });
});

router.get('/cycles/:id/dashboard', auth, async (req, res) => {
  const cycle = await owned(req.params.id, req.user._id);
  if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
  const price = await latestPrice(cycle);
  const predictedProduction = cycle.predictedYield * cycle.areaHectares;
  const [expenses, sales, weather] = await Promise.all([
    Expense.aggregate([{ $match: { cycleId: cycle._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Sale.aggregate([{ $match: { cycleId: cycle._id } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    fetchWeather(cycle.districtId.lat, cycle.districtId.lon),
  ]);
  const latestDisease = await DiseasePrediction.findOne({ cycleId: cycle._id }).sort({ createdAt: -1 }).lean();
  res.json({ stage: stage(cycle), predictedYield: cycle.predictedYield, predictedProduction, currentPrice: price?.price ?? null, arrivalDate: price?.arrivalDate ?? null, currentRevenue: price ? predictedProduction * 10 * price.price : null, totalExpenses: expenses[0]?.total || 0, totalSales: sales[0]?.total || 0, actualProfit: (sales[0]?.total || 0) - (expenses[0]?.total || 0), latestDisease, diseaseSupported: Boolean(plantVillageCrop(cycle.cropId.name)), weather });
});

export default router;
