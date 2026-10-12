import CostBenchmark from '../models/CostBenchmark.js';
import { predictYield } from './mockYieldPrediction.js';
import { getAveragePrice } from './marketPriceService.js';
import { getCropInfo } from '../data/metaOptions.js';

/**
 * Generate a one-time estimation for a crop cycle.
 * Called when the cycle is first created.
 *
 * Formulas (from PRD Section 7):
 *   expectedProduction = predictedYield × area
 *   avgPrice = average market price (per quintal) for the expected harvest month
 *   expectedExpenses = costPerHectare × area
 *   expectedProfit = expectedProduction (in quintals) × avgPrice − expectedExpenses
 *   Unit note: 1 tonne = 10 quintals
 */
export async function generateEstimation(cycle) {
  // 1. Predict yield (tonnes per hectare)
  const predictedYield = predictYield({
    state: cycle.state,
    district: cycle.district,
    season: cycle.season,
    crop: cycle.crop,
    year: new Date(cycle.sowingDate).getFullYear(),
    area: cycle.areaHectares,
  });

  // 2. Calculate predicted production (tonnes)
  const predictedProduction = Math.round(predictedYield * cycle.areaHectares * 100) / 100;

  // 3. Look up cost benchmark
  const benchmark = await CostBenchmark.findOne({
    crop: cycle.crop,
    state: cycle.state,
  });
  const costPerHectare = benchmark ? benchmark.costPerHectare : 50000;

  // 4. Calculate expected expenses
  const expectedExpenses = Math.round(costPerHectare * cycle.areaHectares);

  // 5. Calculate expected harvest month
  const cropInfo = getCropInfo(cycle.crop);
  const durationDays = cropInfo ? cropInfo.avgDurationDays : 120;
  const sowingDate = new Date(cycle.sowingDate);
  const harvestDate = new Date(sowingDate);
  harvestDate.setDate(harvestDate.getDate() + durationDays);
  const harvestMonth = `${harvestDate.getFullYear()}-${String(harvestDate.getMonth() + 1).padStart(2, '0')}`;

  // 6. Get average price for harvest month (₹ per quintal)
  const avgPrice = getAveragePrice(cycle.crop, cycle.preferredMandi, harvestMonth);

  // 7. Convert production to quintals (1 tonne = 10 quintals)
  const productionInQuintals = predictedProduction * 10;

  // 8. Calculate expected profit
  const expectedProfit = Math.round(productionInQuintals * avgPrice - expectedExpenses);

  return {
    predictedYield,
    predictedProduction,
    avgPrice,
    costPerHectare,
    expectedExpenses,
    expectedProfit,
    expectedHarvestDate: harvestDate,
  };
}

export default { generateEstimation };
