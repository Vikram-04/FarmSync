// Meta options for crop cycle creation form
// State → District (with lat/lon for weather) → Mandis
// Crop → Seasons

export const states = [
  {
    name: 'Andhra Pradesh',
    districts: [
      { name: 'Guntur', lat: 16.31, lon: 80.44, mandis: ['Guntur', 'Tenali', 'Sattenapalli'] },
      { name: 'Krishna', lat: 16.57, lon: 80.36, mandis: ['Vijayawada', 'Machilipatnam'] },
      { name: 'East Godavari', lat: 17.32, lon: 82.08, mandis: ['Kakinada', 'Rajahmundry'] },
    ],
  },
  {
    name: 'Gujarat',
    districts: [
      { name: 'Ahmedabad', lat: 23.02, lon: 72.57, mandis: ['Ahmedabad', 'Dholka'] },
      { name: 'Rajkot', lat: 22.30, lon: 70.78, mandis: ['Rajkot', 'Gondal', 'Jetpur'] },
      { name: 'Junagadh', lat: 21.52, lon: 70.47, mandis: ['Junagadh', 'Keshod'] },
    ],
  },
  {
    name: 'Karnataka',
    districts: [
      { name: 'Belgaum', lat: 15.85, lon: 74.50, mandis: ['Belgaum', 'Gokak'] },
      { name: 'Dharwad', lat: 15.46, lon: 75.01, mandis: ['Hubli', 'Dharwad'] },
      { name: 'Mysore', lat: 12.30, lon: 76.66, mandis: ['Mysore', 'Nanjangud'] },
    ],
  },
  {
    name: 'Madhya Pradesh',
    districts: [
      { name: 'Indore', lat: 22.72, lon: 75.86, mandis: ['Indore', 'Mhow'] },
      { name: 'Bhopal', lat: 23.26, lon: 77.41, mandis: ['Bhopal', 'Berasia'] },
      { name: 'Jabalpur', lat: 23.18, lon: 79.95, mandis: ['Jabalpur', 'Sihora'] },
    ],
  },
  {
    name: 'Maharashtra',
    districts: [
      { name: 'Pune', lat: 18.52, lon: 73.86, mandis: ['Pune', 'Baramati', 'Junnar'] },
      { name: 'Nashik', lat: 20.00, lon: 73.78, mandis: ['Nashik', 'Malegaon', 'Sinnar'] },
      { name: 'Nagpur', lat: 21.15, lon: 79.09, mandis: ['Nagpur', 'Kamptee'] },
      { name: 'Solapur', lat: 17.67, lon: 75.91, mandis: ['Solapur', 'Pandharpur'] },
    ],
  },
  {
    name: 'Punjab',
    districts: [
      { name: 'Ludhiana', lat: 30.90, lon: 75.86, mandis: ['Ludhiana', 'Khanna', 'Jagraon'] },
      { name: 'Amritsar', lat: 31.63, lon: 74.87, mandis: ['Amritsar', 'Tarn Taran'] },
      { name: 'Patiala', lat: 30.34, lon: 76.39, mandis: ['Patiala', 'Rajpura', 'Nabha'] },
    ],
  },
  {
    name: 'Rajasthan',
    districts: [
      { name: 'Jaipur', lat: 26.91, lon: 75.79, mandis: ['Jaipur', 'Chomu'] },
      { name: 'Jodhpur', lat: 26.29, lon: 73.02, mandis: ['Jodhpur', 'Phalodi'] },
      { name: 'Kota', lat: 25.18, lon: 75.83, mandis: ['Kota', 'Bundi'] },
    ],
  },
  {
    name: 'Tamil Nadu',
    districts: [
      { name: 'Coimbatore', lat: 11.01, lon: 76.97, mandis: ['Coimbatore', 'Pollachi'] },
      { name: 'Thanjavur', lat: 10.79, lon: 79.14, mandis: ['Thanjavur', 'Kumbakonam'] },
      { name: 'Salem', lat: 11.66, lon: 78.15, mandis: ['Salem', 'Attur'] },
    ],
  },
  {
    name: 'Uttar Pradesh',
    districts: [
      { name: 'Lucknow', lat: 26.85, lon: 80.95, mandis: ['Lucknow', 'Malihabad'] },
      { name: 'Agra', lat: 27.18, lon: 78.02, mandis: ['Agra', 'Firozabad'] },
      { name: 'Varanasi', lat: 25.32, lon: 83.01, mandis: ['Varanasi', 'Chandauli'] },
      { name: 'Meerut', lat: 28.98, lon: 77.71, mandis: ['Meerut', 'Hapur'] },
    ],
  },
  {
    name: 'West Bengal',
    districts: [
      { name: 'Bardhaman', lat: 23.24, lon: 87.86, mandis: ['Bardhaman', 'Durgapur'] },
      { name: 'Hooghly', lat: 22.91, lon: 88.40, mandis: ['Hooghly', 'Chandannagar'] },
      { name: 'Murshidabad', lat: 24.18, lon: 88.27, mandis: ['Murshidabad', 'Berhampore'] },
    ],
  },
];

export const crops = [
  { name: 'Rice', seasons: ['Kharif'], avgDurationDays: 120 },
  { name: 'Wheat', seasons: ['Rabi'], avgDurationDays: 150 },
  { name: 'Maize', seasons: ['Kharif', 'Rabi'], avgDurationDays: 100 },
  { name: 'Cotton', seasons: ['Kharif'], avgDurationDays: 180 },
  { name: 'Sugarcane', seasons: ['Kharif'], avgDurationDays: 360 },
  { name: 'Groundnut', seasons: ['Kharif'], avgDurationDays: 120 },
  { name: 'Mustard', seasons: ['Rabi'], avgDurationDays: 130 },
  { name: 'Gram', seasons: ['Rabi'], avgDurationDays: 110 },
  { name: 'Soybean', seasons: ['Kharif'], avgDurationDays: 100 },
  { name: 'Onion', seasons: ['Rabi', 'Kharif'], avgDurationDays: 130 },
  { name: 'Potato', seasons: ['Rabi'], avgDurationDays: 100 },
  { name: 'Tomato', seasons: ['Kharif', 'Rabi'], avgDurationDays: 90 },
  { name: 'Jowar', seasons: ['Kharif', 'Rabi'], avgDurationDays: 110 },
  { name: 'Bajra', seasons: ['Kharif'], avgDurationDays: 90 },
  { name: 'Barley', seasons: ['Rabi'], avgDurationDays: 130 },
];

export const seasons = ['Kharif', 'Rabi', 'Zaid'];

export const expenseCategories = [
  'Seeds', 'Fertilizers', 'Pesticides', 'Labour',
  'Irrigation', 'Equipment', 'Transport', 'Other',
];

// Helper to get district coordinates
export function getDistrictCoords(stateName, districtName) {
  const state = states.find(s => s.name === stateName);
  if (!state) return null;
  const district = state.districts.find(d => d.name === districtName);
  if (!district) return null;
  return { lat: district.lat, lon: district.lon };
}

// Helper to get crop info
export function getCropInfo(cropName) {
  return crops.find(c => c.name === cropName) || null;
}
