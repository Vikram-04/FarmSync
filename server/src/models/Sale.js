import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  cycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropCycle',
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be positive'],
  },
  pricePerQuintal: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price must not be negative'],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  buyer: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: false,
    default: Date.now,
  },
});

saleSchema.index({ cycleId: 1 });

export default mongoose.model('Sale', saleSchema);
