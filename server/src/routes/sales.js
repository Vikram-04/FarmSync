import express from 'express';
import auth from '../middleware/auth.js';
import CropCycle from '../models/CropCycle.js';
import Sale from '../models/Sale.js';

const router = express.Router();

// POST /api/cycles/:id/sales
router.post('/cycles/:id/sales', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    const { quantity, unit, pricePerUnit, buyer, date } = req.body;
    const totalAmount = quantity * pricePerUnit;

    const sale = await Sale.create({
      cycleId: cycle._id,
      quantity,
      unit: unit || 'quintal',
      pricePerUnit,
      totalAmount,
      buyer: buyer || '',
      date,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cycles/:id/sales
router.get('/cycles/:id/sales', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    const sales = await Sale.find({ cycleId: cycle._id }).sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/sales/:id
router.delete('/sales/:saleId', auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.saleId);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    // Verify ownership through cycle
    const cycle = await CropCycle.findOne({ _id: sale.cycleId, userId: req.user._id });
    if (!cycle) return res.status(403).json({ message: 'Not authorized' });

    await sale.deleteOne();
    res.json({ message: 'Sale deleted' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
