import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Calendar, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function CreateCycle() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [options, setOptions] = useState({
    states: [],
    crops: [],
    seasons: []
  });
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);

  const [formData, setFormData] = useState({
    state: '',
    district: '',
    crop: '',
    season: '',
    areaHectares: '',
    sowingDate: new Date().toISOString().split('T')[0],
    preferredMandi: ''
  });

  // Derived options based on selections
  const [districts, setDistricts] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [availableSeasons, setAvailableSeasons] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/meta/options');
        setOptions(res.data);
      } catch (err) {
        setError('Failed to load form options');
      } finally {
        setIsOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setFormData(prev => ({ ...prev, state: stateName, district: '', preferredMandi: '' }));
    const selectedState = options.states.find(s => s.name === stateName);
    setDistricts(selectedState ? selectedState.districts : []);
    setMandis([]);
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    setFormData(prev => ({ ...prev, district: districtName, preferredMandi: '' }));
    const selectedDistrict = districts.find(d => d.name === districtName);
    setMandis(selectedDistrict ? selectedDistrict.mandis : []);
  };

  const handleCropChange = (e) => {
    const cropName = e.target.value;
    setFormData(prev => ({ ...prev, crop: cropName, season: '' }));
    const selectedCrop = options.crops.find(c => c.name === cropName);
    setAvailableSeasons(selectedCrop ? selectedCrop.seasons : []);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/cycles', formData);
      navigate(`/cycles/${response.data.cycle._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create cycle');
      setIsLoading(false);
    }
  };

  if (isOptionsLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/cycles" className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-white hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Cycle</h1>
          <p className="text-gray-500 text-sm mt-1">Plan your upcoming season and get instant estimates</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Section */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b border-gray-100 pb-2">
                <MapPin className="w-5 h-5 mr-2 text-brand-500" /> Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">State</label>
                  <select
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleStateChange}
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  >
                    <option value="">Select State</option>
                    {options.states.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">District</label>
                  <select
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleDistrictChange}
                    disabled={!formData.state}
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Preferred Mandi</label>
                  <select
                    name="preferredMandi"
                    required
                    value={formData.preferredMandi}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none disabled:opacity-50"
                  >
                    <option value="">Select Mandi</option>
                    {mandis.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Crop Details Section */}
            <div className="space-y-4 md:col-span-2 mt-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b border-gray-100 pb-2">
                <Sprout className="w-5 h-5 mr-2 text-brand-500" /> Crop Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Crop</label>
                  <select
                    name="crop"
                    required
                    value={formData.crop}
                    onChange={handleCropChange}
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  >
                    <option value="">Select Crop</option>
                    {options.crops.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Season</label>
                  <select
                    name="season"
                    required
                    value={formData.season}
                    onChange={handleChange}
                    disabled={!formData.crop}
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none disabled:opacity-50"
                  >
                    <option value="">Select Season</option>
                    {availableSeasons.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">Area (Hectares)</label>
                  <input
                    type="number"
                    name="areaHectares"
                    required
                    min="0.1"
                    step="0.1"
                    value={formData.areaHectares}
                    onChange={handleChange}
                    placeholder="e.g. 2.5"
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" /> Sowing Date
                  </label>
                  <input
                    type="date"
                    name="sowingDate"
                    required
                    value={formData.sowingDate}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 border focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              to="/cycles"
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-2.5 rounded-xl text-white font-medium bg-brand-600 hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 transition-all shadow-sm shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create & Get Estimate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
