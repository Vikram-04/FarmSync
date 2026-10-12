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
    enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Labour', 'Irrigation', 'Equipment', 'Transport', 'Other'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
});

expenseSchema.index({ cycleId: 1 });

export default mongoose.model('Expense', expenseSchema);
