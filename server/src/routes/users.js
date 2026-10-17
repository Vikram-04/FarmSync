import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    res.json(await req.user.populate('stateId districtId'));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const { name, farmName, stateId, districtId, address } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (farmName !== undefined) updates.farmName = farmName;
    if (stateId !== undefined) updates.stateId = stateId || null;
    if (districtId !== undefined) updates.districtId = districtId || null;
    if (address !== undefined) updates.address = address;

    const user = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json(await user.populate('stateId districtId'));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
