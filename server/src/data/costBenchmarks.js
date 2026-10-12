// Base costs per crop in ₹ per hectare (national average)
const baseCosts = {
  Rice: 55000,
  Wheat: 42000,
  Maize: 35000,
  Cotton: 50000,
  Sugarcane: 80000,
  Groundnut: 45000,
  Mustard: 38000,
  Gram: 32000,
  Soybean: 35000,
  Onion: 60000,
  Potato: 55000,
  Tomato: 65000,
  Jowar: 28000,
  Bajra: 25000,
  Barley: 30000,
};

// State-level cost multiplier relative to national average
const stateMultipliers = {
  'Andhra Pradesh': 1.05,
  Gujarat: 0.98,
  Karnataka: 1.0,
  'Madhya Pradesh': 0.92,
  Maharashtra: 1.05,
  Punjab: 1.15,
  Rajasthan: 0.90,
  'Tamil Nadu': 1.08,
  'Uttar Pradesh': 1.0,
  'West Bengal': 0.95,
};

const stateNames = Object.keys(stateMultipliers);
const cropNames = Object.keys(baseCosts);

// Generate all state × crop combinations
export const costBenchmarksData = [];

for (const crop of cropNames) {
  for (const state of stateNames) {
    costBenchmarksData.push({
      crop,
      state,
      costPerHectare: Math.round(baseCosts[crop] * stateMultipliers[state]),
    });
  }
}

export default costBenchmarksData;
