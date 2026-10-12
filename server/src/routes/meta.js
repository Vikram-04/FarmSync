import express from 'express';
import { states, crops, seasons, expenseCategories } from '../data/metaOptions.js';

const router = express.Router();

// GET /api/meta/options – Dropdown data for cycle creation form
router.get('/options', (req, res) => {
  res.json({
    states: states.map(s => ({
      name: s.name,
      districts: s.districts.map(d => ({
        name: d.name,
        mandis: d.mandis,
      })),
    })),
    crops: crops.map(c => ({
      name: c.name,
      seasons: c.seasons,
    })),
    seasons,
    expenseCategories,
  });
});

export default router;
