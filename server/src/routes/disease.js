import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import CropCycle from '../models/CropCycle.js';
import DiseasePrediction from '../models/DiseasePrediction.js';
import { predictDisease } from '../services/mockDiseasePrediction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  },
});

const router = express.Router();

// POST /api/cycles/:id/disease – Upload image and predict disease
router.post('/cycles/:id/disease', auth, upload.single('image'), async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id }).populate('cropId');
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Run mock disease prediction
    const prediction = predictDisease(cycle.cropId.name, req.file.path);

    const diseasePrediction = await DiseasePrediction.create({
      cycleId: cycle._id,
      imageUrl,
      disease: prediction.disease,
      confidence: prediction.confidence,
    });

    res.status(201).json(diseasePrediction);
  } catch (error) {
    console.error('Disease prediction error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/cycles/:id/disease – Get prediction history
router.get('/cycles/:id/disease', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    const predictions = await DiseasePrediction.find({ cycleId: cycle._id })
      .sort({ createdAt: -1 });
    res.json(predictions);
  } catch (error) {
    console.error('Get disease history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
