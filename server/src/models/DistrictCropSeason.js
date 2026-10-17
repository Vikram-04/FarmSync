import mongoose from 'mongoose';

const districtCropSeasonSchema = new mongoose.Schema({
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
}, { collection: 'districtCropSeasons' });

districtCropSeasonSchema.index({ districtId: 1, cropId: 1, seasonId: 1 }, { unique: true });
export default mongoose.model('DistrictCropSeason', districtCropSeasonSchema);