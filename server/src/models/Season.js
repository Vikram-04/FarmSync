import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
}, { collection: 'seasons' });

export default mongoose.model('Season', seasonSchema);