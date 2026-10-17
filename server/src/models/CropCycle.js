import mongoose from 'mongoose';

const cropCycleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  mandiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandi', required: true },
  areaHectares: {
    type: Number,
    required: [true, 'Area is required'],
    min: [0.1, 'Area must be at least 0.1 hectares'],
  },
  sowingDate: {
    type: Date,
    required: [true, 'Sowing date is required'],
  },
  predictedYield: { type: Number, required: true, min: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cropCycleSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('CropCycle', cropCycleSchema, 'cropCycles');
