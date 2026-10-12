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
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'tonne'],
    default: 'quintal',
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price must be positive'],
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
    required: [true, 'Date is required'],
  },
});

saleSchema.index({ cycleId: 1 });

export default mongoose.model('Sale', saleSchema);
