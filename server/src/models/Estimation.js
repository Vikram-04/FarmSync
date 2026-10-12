import mongoose from 'mongoose';

const estimationSchema = new mongoose.Schema({
  cycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropCycle',
    required: true,
    unique: true,
  },
  predictedYield: {
    type: Number,
    required: true, // tonnes per hectare
  },
  predictedProduction: {
    type: Number,
    required: true, // tonnes (yield × area)
  },
  avgPrice: {
    type: Number,
    required: true, // ₹ per quintal
  },
  costPerHectare: {
    type: Number,
    required: true, // ₹ per hectare
  },
  expectedExpenses: {
    type: Number,
    required: true, // costPerHectare × area
  },
  expectedProfit: {
    type: Number,
    required: true, // production_in_quintals × avgPrice − expectedExpenses
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Estimation', estimationSchema);
