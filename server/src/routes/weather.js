import express from 'express';
import axios from 'axios';
import { getDistrictCoords } from '../data/metaOptions.js';

const router = express.Router();

// GET /api/weather?state=...&district=...
router.get('/', async (req, res) => {
  try {
    const { state, district } = req.query;

    if (!state || !district) {
      return res.status(400).json({ message: 'State and district are required' });
    }

    const coords = getDistrictCoords(state, district);
    if (!coords) {
      return res.status(404).json({ message: 'District coordinates not found' });
    }

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
        timezone: 'Asia/Kolkata',
        forecast_days: 7,
      },
      timeout: 8000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

export default router;
