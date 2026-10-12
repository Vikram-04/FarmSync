import mongoose from 'mongoose';

const cropCycleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  crop: {
    type: String,
    required: [true, 'Crop is required'],
    trim: true,
  },
  season: {
    type: String,
    required: [true, 'Season is required'],
    enum: ['Kharif', 'Rabi', 'Zaid'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  areaHectares: {
    type: Number,
    required: [true, 'Area is required'],
    min: [0.1, 'Area must be at least 0.1 hectares'],
  },
  sowingDate: {
    type: Date,
    required: [true, 'Sowing date is required'],
  },
  expectedHarvestDate: {
    type: Date,
  },
  preferredMandi: {
    type: String,
    required: [true, 'Preferred mandi is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cropCycleSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('CropCycle', cropCycleSchema);
