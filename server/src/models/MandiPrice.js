import mongoose from 'mongoose';

const mandiPriceSchema = new mongoose.Schema({
  mandiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandi', required: true },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  fetchDate: { type: String, required: true },
  arrivalDate: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
}, { collection: 'mandiPrices' });

mandiPriceSchema.index({ mandiId: 1, cropId: 1, fetchDate: 1 }, { unique: true });
export default mongoose.model('MandiPrice', mandiPriceSchema);
