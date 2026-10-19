import Crop from '../models/Crop.js';
import Mandi from '../models/Mandi.js';
import MandiPrice from '../models/MandiPrice.js';
import CropCycle from '../models/CropCycle.js';
import { fetchCommodityRecords, nameKey } from './priceApi.js';

const indiaDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

// No valid price today for this (mandi, crop): copy the newest earlier row into today.
// Insert-only, so a row that already exists for today is never overwritten.
// If there is no earlier row, nothing is stored.
async function carryForwardPrice(mandiId, cropId, fetchDate) {
  const last = await MandiPrice.findOne({ mandiId, cropId }).sort({ fetchDate: -1 });
  if (!last) return;
  await MandiPrice.updateOne(
    { mandiId, cropId, fetchDate },
    { $setOnInsert: { arrivalDate: last.arrivalDate, price: last.price } },
    { upsert: true },
  );
}

export async function updatePricesForCrop(cropId, requestedMandiIds = null) {
  const crop = await Crop.findById(cropId);
  if (!crop) throw new Error('Crop not found');
  const mandis = await Mandi.find(requestedMandiIds ? { _id: { $in: requestedMandiIds } } : { cropIds: crop._id });
  const fetchDate = indiaDate();

  // If the API call fails, keep going with no records so every mandi still gets a carried-forward row.
  let records = [];
  try {
    records = await fetchCommodityRecords(crop.priceCommodity);
  } catch (error) {
    console.error(`Price fetch failed for ${crop.priceCommodity}:`, error.message);
  }

  for (const mandi of mandis) {
    const matching = records.filter((record) =>
      nameKey(record.state) === nameKey(mandi.state)
      && nameKey(record.district) === nameKey(mandi.district)
      && nameKey(record.market) === nameKey(mandi.market)
      && record.modalPrice != null
      && record.arrivalDate
    );
    if (!matching.length) {
      await carryForwardPrice(mandi._id, crop._id, fetchDate);
      continue;
    }
    const latestDate = matching.reduce((latest, record) => record.arrivalDate > latest ? record.arrivalDate : latest, matching[0].arrivalDate);
    const latest = matching.filter((record) => record.arrivalDate === latestDate);
    const price = latest.reduce((sum, record) => sum + record.modalPrice, 0) / latest.length;
    // A real price replaces a carried-forward row from earlier the same day.
    await MandiPrice.findOneAndUpdate(
      { mandiId: mandi._id, cropId: crop._id, fetchDate },
      { arrivalDate: latestDate, price },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

export async function updatePricesForCycle(cycle) {
  return updatePricesForCrop(cycle.cropId, [cycle.mandiId]);
}

export async function updateAllCyclePrices() {
  const pairs = await CropCycle.aggregate([{ $group: { _id: '$cropId', mandiIds: { $addToSet: '$mandiId' } } }]);
  for (const pair of pairs) {
    try {
      await updatePricesForCrop(pair._id, pair.mandiIds);
    } catch (error) {
      console.error(`Price update failed for crop ${pair._id}:`, error.message);
    }
  }
}