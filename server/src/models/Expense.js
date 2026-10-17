import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  cycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropCycle',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['seeds', 'fertilizer', 'pesticide', 'labour', 'irrigation', 'machinery', 'other'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must not be negative'],
  },
  date: {
    type: Date,
    required: false,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
});

expenseSchema.index({ cycleId: 1 });

export default mongoose.model('Expense', expenseSchema);
