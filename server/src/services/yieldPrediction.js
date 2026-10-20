import axios from 'axios';

const serviceUrl = process.env.YIELD_SERVICE_URL || 'http://127.0.0.1:8000';

export class YieldPredictionError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 503;
  }
}

export async function predictYield({ state, district, season, crop, year, area }) {
  try {
    const { data } = await axios.post(`${serviceUrl}/predict`, {
      state_name: state,
      district_name: district,
      crop_year: year,
      season,
      crop,
      area,
    }, { timeout: 15000 });

    if (!Number.isFinite(data?.yield_t_per_ha) || data.yield_t_per_ha < 0) {
      throw new YieldPredictionError('Yield service returned an invalid prediction');
    }

    return data.yield_t_per_ha;
  } catch (error) {
    if (error instanceof YieldPredictionError) throw error;
    const message = error.response?.data?.detail || error.message || 'Yield service request failed';
    throw new YieldPredictionError(`Yield prediction unavailable: ${message}`);
  }
}

export default { predictYield };
