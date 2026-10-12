// Mock market price service
// Returns realistic mandi prices for crops
// Will be replaced with real Agmarknet API calls later

// Base prices per quintal (₹) for each crop
const basePrices = {
  Rice: 2200,
  Wheat: 2300,
  Maize: 1900,
  Cotton: 6200,
  Sugarcane: 350,
  Groundnut: 5500,
  Mustard: 5000,
  Gram: 5200,
  Soybean: 4200,
  Onion: 1800,
  Potato: 1200,
  Tomato: 2500,
  Jowar: 2800,
  Bajra: 2300,
  Barley: 1800,
};

/**
 * Get current market price for a crop at a mandi
 * @returns {{ price: number, mandi: string, date: string }}
 */
export function getCurrentPrice(crop, mandi) {
  const base = basePrices[crop] || 2000;
  // Add mandi-specific variation
  const mandiSeed = mandi.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variation = ((mandiSeed % 20) - 10) / 100; // ±10%
  const price = Math.round(base * (1 + variation));

  return {
    price,
    mandi,
    crop,
    date: new Date().toISOString().split('T')[0],
  };
}

/**
 * Get daily prices for the current month (for the price fluctuation graph)
 * @returns {Array<{ date: string, price: number }>}
 */
export function getMonthlyPrices(crop, mandi) {
  const base = basePrices[crop] || 2000;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const prices = [];
  // Seed for deterministic but varied prices
  const mandiSeed = mandi.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let day = 1; day <= Math.min(today, daysInMonth); day++) {
    const daySeed = (mandiSeed + day * 7 + month * 31) % 100;
    const dailyVariation = ((daySeed - 50) / 500); // Small daily variation
    const trendVariation = Math.sin(day / daysInMonth * Math.PI) * 0.03; // Slight trend
    const price = Math.round(base * (1 + dailyVariation + trendVariation));

    prices.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      price,
    });
  }

  return prices;
}

/**
 * Get average price for a specific month (used in profit estimation)
 * @returns {number} average price per quintal
 */
export function getAveragePrice(crop, mandi, monthStr) {
  const base = basePrices[crop] || 2000;
  // Parse month string like "2026-03"
  const mandiSeed = mandi.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const monthSeed = monthStr ? monthStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
  const combinedSeed = (mandiSeed + monthSeed) % 100;
  const variation = ((combinedSeed - 50) / 200); // ±25% variation
  return Math.round(base * (1 + variation));
}

export default { getCurrentPrice, getMonthlyPrices, getAveragePrice };
