import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  priceCommodity: { type: String, required: true, trim: true },
  durationDays: { type: Number, required: true, min: 1 },
}, { collection: 'crops' });

cropSchema.index({ name: 1 }, { unique: true });
export default mongoose.model('Crop', cropSchema);