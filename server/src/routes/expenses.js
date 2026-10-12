import express from 'express';
import auth from '../middleware/auth.js';
import CropCycle from '../models/CropCycle.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// POST /api/cycles/:id/expenses
router.post('/cycles/:id/expenses', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    const { category, amount, date, note } = req.body;
    const expense = await Expense.create({
      cycleId: cycle._id,
      category,
      amount,
      date,
      note: note || '',
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/cycles/:id/expenses
router.get('/cycles/:id/expenses', auth, async (req, res) => {
  try {
    const cycle = await CropCycle.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });

    const expenses = await Expense.find({ cycleId: cycle._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/expenses/:id
router.delete('/expenses/:expenseId', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Verify ownership through cycle
    const cycle = await CropCycle.findOne({ _id: expense.cycleId, userId: req.user._id });
    if (!cycle) return res.status(403).json({ message: 'Not authorized' });

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
