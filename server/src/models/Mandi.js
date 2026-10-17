import mongoose from 'mongoose';

const mandiSchema = new mongoose.Schema({
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  market: { type: String, required: true, trim: true },
  cropIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
}, { collection: 'mandis' });

mandiSchema.index({ state: 1, district: 1, market: 1 }, { unique: true });
mandiSchema.index({ cropIds: 1 });
export default mongoose.model('Mandi', mandiSchema);