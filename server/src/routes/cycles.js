import express from 'express';
import auth from '../middleware/auth.js';
import CropCycle from '../models/CropCycle.js';
import Estimation from '../models/Estimation.js';
import DiseasePrediction from '../models/DiseasePrediction.js';
import Expense from '../models/Expense.js';
import Sale from '../models/Sale.js';
import { generateEstimation } from '../services/estimationService.js';
import { getCropInfo, getDistrictCoords } from '../data/metaOptions.js';
import { getCurrentPrice } from '../services/marketPriceService.js';
import axios from 'axios';

const router = express.Router();

// Helper: calculate crop stage from sowing date
function getCropStage(sowingDate, crop) {
  const cropInfo = getCropInfo(crop);
  const duration = cropInfo ? cropInfo.avgDurationDays : 120;
  const elapsed = (Date.now() - new Date(sowingDate).getTime()) / (1000 * 60 * 60 * 24);
  const progress = elapsed / duration;

  if (progress < 0) return { stage: 'Not Started', progress: 0 };
  if (progress < 0.1) return { stage: 'Sowing', progress: Math.round(progress * 100) };
  if (progress < 0.2) return { stage: 'Germination', progress: Math.round(progress * 100) };
  if (progress < 0.45) return { stage: 'Vegetative', progress: Math.round(progress * 100) };
  if (progress < 0.6) return { stage: 'Flowering', progress: Math.round(progress * 100) };
  if (progress < 0.8) return { stage: 'Grain Filling', progress: Math.round(progress * 100) };
  if (progress < 0.95) return { stage: 'Maturity', progress: Math.round(progress * 100) };
  return { stage: 'Harvest Ready', progress: 100 };
}

// Helper: generate warnings from weather + disease
function generateWarnings(weather, latestDisease) {
  const warnings = [];

  if (weather && weather.daily) {
    const { temperature_2m_max, temperature_2m_min, precipitation_sum } = weather.daily;

    for (let i = 0; i < (temperature_2m_max || []).length; i++) {
      if (temperature_2m_max[i] > 42) {
        warnings.push({ type: 'heat', message: `Extreme heat (${temperature_2m_max[i]}°C) expected on ${weather.daily.time[i]}` });
        break;
      }
    }

    for (let i = 0; i < (temperature_2m_min || []).length; i++) {
      if (temperature_2m_min[i] < 4) {
        warnings.push({ type: 'frost', message: `Frost risk (${temperature_2m_min[i]}°C) expected on ${weather.daily.time[i]}` });
        break;
      }
    }

    for (let i = 0; i < (precipitation_sum || []).length; i++) {
      if (precipitation_sum[i] > 50) {
        warnings.push({ type: 'rain', message: `Heavy rainfall (${precipitation_sum[i]}mm) expected on ${weather.daily.time[i]}` });
        break;
      }
    }
  }

  if (latestDisease && latestDisease.disease !== 'Healthy') {
    warnings.push({
      type: 'disease',
      message: `${latestDisease.disease} detected (${Math.round(latestDisease.confidence * 100)}% confidence)`,
    });
  }

  return warnings;
}

// POST /api/cycles – Create cycle and generate estimation
router.post('/', auth, async (req, res) => {
  try {
    const { crop, season, state, district, areaHectares, sowingDate, preferredMandi } = req.body;

    // Calculate expected harvest date
    const cropInfo = getCropInfo(crop);
    const durationDays = cropInfo ? cropInfo.avgDurationDays : 120;
    const sowing = new Date(sowingDate);
    const expectedHarvestDate = new Date(sowing);
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + durationDays);

    const cycle = await CropCycle.create({
      userId: req.user._id,
      crop,
      season,
      state,
      district,
      areaHectares,
      sowingDate: sowing,
      expectedHarvestDate,
      preferredMandi,
    });

    // Generate and save estimation
    const estData = await generateEstimation(cycle);
    const estimation = await Estimation.create({
      cycleId: cycle._id,
      ...estData,
    });

    // Update cycle with expected harvest date from estimation
    if (estData.expectedHarvestDate) {
      cycle.expectedHarvestDate = estData.expectedHarvestDate;
      await cycle.save();
    }

    res.status(201).json({ cycle, estimation });
  } catch (error) {
    console.error('Create cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cycles – List user's cycles
router.get('/', auth, async (req, res) => {
  try {
    const cycles = await CropCycle.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(cycles);
  } catch (error) {
    console.error('List cycles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cycles/:id – Get single cycle
router.get('/:id', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    res.json(cycle);
  } catch (error) {
    console.error('Get cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/cycles/:id – Update non-estimate fields
router.put('/:id', auth, async (req, res) => {
  try {
    const { preferredMandi, sowingDate, status } = req.body;
    const updates = {};
    if (preferredMandi !== undefined) updates.preferredMandi = preferredMandi;
    if (sowingDate !== undefined) updates.sowingDate = sowingDate;
    if (status !== undefined) updates.status = status;

    const cycle = await CropCycle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    res.json(cycle);
  } catch (error) {
    console.error('Update cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/cycles/:id – Delete cycle and all related data
router.delete('/:id', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    // Clean up related documents
    await Promise.all([
      Estimation.deleteMany({ cycleId: cycle._id }),
      DiseasePrediction.deleteMany({ cycleId: cycle._id }),
      Expense.deleteMany({ cycleId: cycle._id }),
      Sale.deleteMany({ cycleId: cycle._id }),
    ]);

    res.json({ message: 'Cycle deleted' });
  } catch (error) {
    console.error('Delete cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cycles/:id/dashboard – Aggregated dashboard data
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    // Parallelize all data fetching
    const [estimation, latestDisease, expenses, sales] = await Promise.all([
      Estimation.findOne({ cycleId: cycle._id }),
      DiseasePrediction.findOne({ cycleId: cycle._id }).sort({ createdAt: -1 }),
      Expense.find({ cycleId: cycle._id }),
      Sale.find({ cycleId: cycle._id }),
    ]);

    // Crop stage
    const cropStage = getCropStage(cycle.sowingDate, cycle.crop);

    // Weather (from Open-Meteo, may fail gracefully)
    let weather = null;
    try {
      const coords = getDistrictCoords(cycle.state, cycle.district);
      if (coords) {
        const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: coords.lat,
            longitude: coords.lon,
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
            timezone: 'Asia/Kolkata',
            forecast_days: 7,
          },
          timeout: 5000,
        });
        weather = weatherRes.data;
      }
    } catch (err) {
      console.warn('Weather API failed:', err.message);
    }

    // Warnings
    const warnings = generateWarnings(weather, latestDisease);

    // Expense overview
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const expensesByCategory = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    // Sales
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const actualProfit = totalSales - totalExpenses;

    // Current market price
    const currentPrice = getCurrentPrice(cycle.crop, cycle.preferredMandi);

    res.json({
      cycle,
      cropStage,
      weather,
      warnings,
      estimation,
      expenseOverview: {
        totalExpenses,
        expensesByCategory,
        expectedExpenses: estimation?.expectedExpenses || 0,
      },
      latestDisease,
      currentPrice,
      financeSummary: {
        totalExpenses,
        totalSales,
        actualProfit,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
