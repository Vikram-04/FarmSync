import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  name: { type: String, required: true, trim: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
}, { collection: 'districts' });

districtSchema.index({ stateId: 1, name: 1 }, { unique: true });
export default mongoose.model('District', districtSchema);