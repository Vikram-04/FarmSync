// Mock yield prediction service
// Returns predictedYield in tonnes per hectare
// Will be replaced with real ML model HTTP call later

// Realistic yield ranges by crop (tonnes per hectare)
const yieldRanges = {
  Rice: { min: 2.5, max: 5.0 },
  Wheat: { min: 2.8, max: 4.5 },
  Maize: { min: 2.0, max: 4.0 },
  Cotton: { min: 1.2, max: 2.5 },
  Sugarcane: { min: 60, max: 85 },
  Groundnut: { min: 1.5, max: 2.8 },
  Mustard: { min: 1.0, max: 1.8 },
  Gram: { min: 0.8, max: 1.5 },
  Soybean: { min: 1.0, max: 2.0 },
  Onion: { min: 15, max: 25 },
  Potato: { min: 18, max: 30 },
  Tomato: { min: 20, max: 35 },
  Jowar: { min: 0.8, max: 1.5 },
  Bajra: { min: 0.8, max: 1.8 },
  Barley: { min: 2.0, max: 3.5 },
};

/**
 * Mock yield prediction
 * @param {Object} input - { state, district, season, crop, year, area }
 * @returns {number} predictedYield in tonnes per hectare
 */
export function predictYield({ state, district, season, crop, year, area }) {
  const range = yieldRanges[crop] || { min: 1.0, max: 3.0 };

  // Generate a deterministic-looking but varied value based on inputs
  const seed = (state + district + crop + season + year).split('').reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  );
  const normalized = (seed % 100) / 100;
  const predictedYield = range.min + normalized * (range.max - range.min);

  return Math.round(predictedYield * 100) / 100;
}

export default { predictYield };
