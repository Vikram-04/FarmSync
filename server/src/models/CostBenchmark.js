import mongoose from 'mongoose';

const costBenchmarkSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  costPerHectare: {
    type: Number,
    required: true,
  },
});

costBenchmarkSchema.index({ crop: 1, state: 1 }, { unique: true });

export default mongoose.model('CostBenchmark', costBenchmarkSchema);
