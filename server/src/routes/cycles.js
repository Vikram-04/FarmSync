import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import CropCycle from '../models/CropCycle.js';
import District from '../models/District.js';
import '../models/State.js';
import Crop from '../models/Crop.js';
import Season from '../models/Season.js';
import Mandi from '../models/Mandi.js';
import DistrictCropSeason from '../models/DistrictCropSeason.js';
import DiseasePrediction from '../models/DiseasePrediction.js';
import Expense from '../models/Expense.js';
import Sale from '../models/Sale.js';
import { predictYield } from '../services/yieldPrediction.js';
import { updatePricesForCycle } from '../services/priceService.js';

const router = express.Router();
const validId = (id) => mongoose.isValidObjectId(id);

async function ownedCycle(id, userId) {
  if (!validId(id)) return null;
  return CropCycle.findOne({ _id: id, userId });
}

// Create a cycle from seeded reference ids. Reference combinations are validated
// before the yield service is called.
router.post('/', auth, async (req, res) => {
  try {
    const { districtId, cropId, seasonId, mandiId, areaHectares, sowingDate } = req.body;
    if (![districtId, cropId, seasonId, mandiId, areaHectares, sowingDate].every(Boolean)) {
      return res.status(400).json({ message: 'districtId, cropId, seasonId, mandiId, areaHectares and sowingDate are required' });
    }
    if (![districtId, cropId, seasonId, mandiId].every(validId)) {
      return res.status(400).json({ message: 'Invalid reference id' });
    }
    const [district, crop, season, mandi, combination] = await Promise.all([
      District.findById(districtId).populate('stateId'),
      Crop.findById(cropId),
      Season.findById(seasonId),
      Mandi.findById(mandiId),
      DistrictCropSeason.findOne({ districtId, cropId, seasonId }),
    ]);
    if (!district || !crop || !season || !mandi || !combination) {
      return res.status(400).json({ message: 'Invalid seeded reference selection' });
    }
    if (!mandi.cropIds.some((id) => String(id) === String(cropId))) {
      return res.status(400).json({ message: 'Mandi does not trade the selected crop' });
    }
    const area = Number(areaHectares);
    if (!Number.isFinite(area) || area <= 0) return res.status(400).json({ message: 'areaHectares must be greater than zero' });
    const date = new Date(sowingDate);
    if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid sowingDate' });

    const predictedYield = await predictYield({
      state: district.stateId?.name,
      district: district.name,
      crop: crop.name,
      season: season.name,
      year: date.getFullYear(),
      area,
    });
    const cycle = await CropCycle.create({
      userId: req.user._id, districtId, cropId, seasonId, mandiId,
      areaHectares: area, sowingDate: date, predictedYield,
    });
    await req.user.constructor.findByIdAndUpdate(req.user._id, { stateId: district.stateId?._id, districtId });
    try {
      await updatePricesForCycle(cycle);
    } catch (priceError) {
      console.error('Initial price update failed:', priceError.message);
    }
    const result = await CropCycle.findById(cycle._id)
      .populate('districtId cropId seasonId mandiId').lean();
    res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    console.error('Create cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    res.json(await CropCycle.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).populate('districtId cropId seasonId mandiId').lean());
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const cycle = await ownedCycle(req.params.id, req.user._id);
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    res.json(await cycle.populate('districtId cropId seasonId mandiId'));
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const cycle = await ownedCycle(req.params.id, req.user._id);
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    await cycle.deleteOne();
    await Promise.all([
      Expense.deleteMany({ cycleId: cycle._id }),
      Sale.deleteMany({ cycleId: cycle._id }),
      DiseasePrediction.deleteMany({ cycleId: cycle._id }),
    ]);
    res.json({ message: 'Cycle deleted' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

export default router;
