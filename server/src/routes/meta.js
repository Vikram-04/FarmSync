import express from 'express';
import State from '../models/State.js';
import District from '../models/District.js';
import Crop from '../models/Crop.js';
import Season from '../models/Season.js';
import DistrictCropSeason from '../models/DistrictCropSeason.js';
import Mandi from '../models/Mandi.js';

const router = express.Router();

router.get('/states', async (req, res) => {
  try { res.json(await State.find({}).sort({ name: 1 }).lean()); }
  catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/districts', async (req, res) => {
  if (!req.query.stateId) return res.status(400).json({ message: 'stateId is required' });
  try { res.json(await District.find({ stateId: req.query.stateId }).sort({ name: 1 }).lean()); }
  catch (error) { res.status(400).json({ message: 'Invalid stateId' }); }
});

router.get('/crops', async (req, res) => {
  if (!req.query.districtId) return res.status(400).json({ message: 'districtId is required' });
  try {
    const rows = await DistrictCropSeason.find({ districtId: req.query.districtId }).distinct('cropId');
    const crops = await Crop.find({ _id: { $in: rows } }).sort({ priceCommodity: 1 }).select('_id priceCommodity').lean();
    res.json(crops);
  } catch (error) { res.status(400).json({ message: 'Invalid districtId' }); }
});

router.get('/seasons', async (req, res) => {
  const { districtId, cropId } = req.query;
  if (!districtId || !cropId) return res.status(400).json({ message: 'districtId and cropId are required' });
  try {
    const rows = await DistrictCropSeason.find({ districtId, cropId }).distinct('seasonId');
    res.json(await Season.find({ _id: { $in: rows } }).sort({ name: 1 }).lean());
  } catch (error) { res.status(400).json({ message: 'Invalid districtId or cropId' }); }
});

router.get('/mandis', async (req, res) => {
  if (!req.query.cropId) return res.status(400).json({ message: 'cropId is required' });
  try {
    res.json(await Mandi.find({ cropIds: req.query.cropId })
      .select('_id market district state').sort({ market: 1 }).lean());
  } catch (error) { res.status(400).json({ message: 'Invalid cropId' }); }
});

export default router;
