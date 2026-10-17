import axios from 'axios';

export const WEATHER_THRESHOLDS = { rain: 64.5, heat: 40, cold: 5, wind: 40 };

export async function fetchWeather(lat, lon) {
  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: lat, longitude: lon, forecast_days: 7, timezone: 'Asia/Kolkata',
      daily: 'precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max',
    },
    timeout: 15000,
  });
  const daily = data.daily || {};
  const forecast = (daily.time || []).map((date, index) => {
    const values = {
      date,
      rain: daily.precipitation_sum?.[index],
      maxTemperature: daily.temperature_2m_max?.[index],
      minTemperature: daily.temperature_2m_min?.[index],
      maxWind: daily.wind_speed_10m_max?.[index],
    };
    const warnings = [];
    if (values.rain >= WEATHER_THRESHOLDS.rain) warnings.push('Heavy rain');
    if (values.maxTemperature >= WEATHER_THRESHOLDS.heat) warnings.push('Heat');
    if (values.minTemperature <= WEATHER_THRESHOLDS.cold) warnings.push('Cold');
    if (values.maxWind >= WEATHER_THRESHOLDS.wind) warnings.push('Strong wind');
    return { ...values, warnings };
  });
  return { forecast, warnings: forecast.flatMap((day) => day.warnings.map((warning) => `${day.date}: ${warning}`)) };
}
