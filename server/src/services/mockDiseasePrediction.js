// Mock disease prediction service
// Will be replaced with real ML model HTTP call later

const diseases = {
  Rice: [
    { disease: 'Bacterial Leaf Blight', confidence: 0.87 },
    { disease: 'Brown Spot', confidence: 0.82 },
    { disease: 'Leaf Smut', confidence: 0.79 },
    { disease: 'Healthy', confidence: 0.95 },
  ],
  Wheat: [
    { disease: 'Leaf Rust', confidence: 0.91 },
    { disease: 'Septoria', confidence: 0.84 },
    { disease: 'Yellow Rust', confidence: 0.88 },
    { disease: 'Healthy', confidence: 0.96 },
  ],
  Cotton: [
    { disease: 'Bacterial Blight', confidence: 0.85 },
    { disease: 'Curl Virus', confidence: 0.80 },
    { disease: 'Healthy', confidence: 0.93 },
  ],
  Maize: [
    { disease: 'Northern Leaf Blight', confidence: 0.86 },
    { disease: 'Common Rust', confidence: 0.83 },
    { disease: 'Gray Leaf Spot', confidence: 0.81 },
    { disease: 'Healthy', confidence: 0.94 },
  ],
  Tomato: [
    { disease: 'Early Blight', confidence: 0.89 },
    { disease: 'Late Blight', confidence: 0.85 },
    { disease: 'Leaf Mold', confidence: 0.82 },
    { disease: 'Healthy', confidence: 0.95 },
  ],
  Potato: [
    { disease: 'Early Blight', confidence: 0.87 },
    { disease: 'Late Blight', confidence: 0.90 },
    { disease: 'Healthy', confidence: 0.94 },
  ],
  default: [
    { disease: 'Fungal Infection', confidence: 0.78 },
    { disease: 'Bacterial Infection', confidence: 0.75 },
    { disease: 'Nutrient Deficiency', confidence: 0.72 },
    { disease: 'Healthy', confidence: 0.93 },
  ],
};

/**
 * Mock disease prediction
 * @param {string} crop - The crop type
 * @param {string} imagePath - Path to the uploaded image
 * @returns {{ disease: string, confidence: number }}
 */
export function predictDisease(crop, imagePath) {
  const options = diseases[crop] || diseases.default;
  const randomIndex = Math.floor(Math.random() * options.length);
  const prediction = options[randomIndex];

  // Add some random variation to confidence
  const variation = (Math.random() - 0.5) * 0.1;
  const confidence = Math.min(0.99, Math.max(0.5, prediction.confidence + variation));

  return {
    disease: prediction.disease,
    confidence: Math.round(confidence * 100) / 100,
  };
}

export default { predictDisease };
