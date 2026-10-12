import express from 'express';
import auth from '../middleware/auth.js';
import Estimation from '../models/Estimation.js';
import CropCycle from '../models/CropCycle.js';

const router = express.Router();

// GET /api/cycles/:id/estimate
router.get('/cycles/:id/estimate', auth, async (req, res) => {
  try {
    // Verify cycle belongs to user
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    const estimation = await Estimation.findOne({ cycleId: req.params.id });
    if (!estimation) return res.status(404).json({ message: 'Estimation not found' });

    // Add breakdown info
    const productionInQuintals = estimation.predictedProduction * 10;
    const breakdown = {
      formula: 'Expected Profit = (Predicted Production in Quintals × Avg Price per Quintal) − Expected Expenses',
      steps: [
        `Predicted Yield = ${estimation.predictedYield} tonnes/hectare`,
        `Area = ${cycle.areaHectares} hectares`,
        `Predicted Production = ${estimation.predictedYield} × ${cycle.areaHectares} = ${estimation.predictedProduction} tonnes`,
        `Production in Quintals = ${estimation.predictedProduction} × 10 = ${productionInQuintals} quintals`,
        `Avg Market Price = ₹${estimation.avgPrice}/quintal (for expected harvest month)`,
        `Revenue = ${productionInQuintals} × ₹${estimation.avgPrice} = ₹${Math.round(productionInQuintals * estimation.avgPrice)}`,
        `Cost per Hectare = ₹${estimation.costPerHectare}`,
        `Expected Expenses = ₹${estimation.costPerHectare} × ${cycle.areaHectares} = ₹${estimation.expectedExpenses}`,
        `Expected Profit = ₹${Math.round(productionInQuintals * estimation.avgPrice)} − ₹${estimation.expectedExpenses} = ₹${estimation.expectedProfit}`,
      ],
    };

    res.json({ estimation, breakdown, cycle });
  } catch (error) {
    console.error('Get estimation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
