import mongoose from 'mongoose';

const diseasePredictionSchema = new mongoose.Schema({
  cycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropCycle',
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

diseasePredictionSchema.index({ cycleId: 1, createdAt: -1 });

export default mongoose.model('DiseasePrediction', diseasePredictionSchema);
