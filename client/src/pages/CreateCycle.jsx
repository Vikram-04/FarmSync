import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sprout } from 'lucide-react';
import api from '../lib/api';
import SearchableSelect from '../components/SearchableSelect';
import { titleCase } from '../components/ui';

const field = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400';

export default function CreateCycle() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [form, setForm] = useState({
    stateId: '', districtId: '', cropId: '', seasonId: '', mandiId: '',
    areaHectares: '', sowingDate: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm(c => ({ ...c, [key]: value }));

  const load = async (url, setter) => {
    try {
      const { data } = await api.get(url);
      setter(data);
      return data;
    } catch {
      return null;
    }
  };

  // Load states + user profile for prefill
  useEffect(() => {
    Promise.all([api.get('/meta/states'), api.get('/users/me')]).then(([s, u]) => {
      setStates(s.data);
      const user = u.data;
      if (user.stateId?._id) {
        set('stateId', user.stateId._id);
        load(`/meta/districts?stateId=${user.stateId._id}`, setDistricts).then(() => {
          if (user.districtId?._id) set('districtId', user.districtId._id);
        });
      }
    }).catch(() => setError('Unable to load form data'));
  }, []);

  const stateChange = (v) => {
    set('stateId', v);
    setDistricts([]); setCrops([]); setSeasons([]); setMandis([]);
    set('districtId', ''); set('cropId', ''); set('seasonId', ''); set('mandiId', '');
    if (v) load(`/meta/districts?stateId=${v}`, setDistricts);
  };

  const districtChange = (v) => {
    set('districtId', v);
    setCrops([]); setSeasons([]); setMandis([]);
    set('cropId', ''); set('seasonId', ''); set('mandiId', '');
    if (v) load(`/meta/crops?districtId=${v}`, setCrops);
  };

  const cropChange = (v) => {
    set('cropId', v);
    setSeasons([]); setMandis([]);
    set('seasonId', ''); set('mandiId', '');
    if (v) {
      load(`/meta/seasons?districtId=${form.districtId}&cropId=${v}`, setSeasons);
      load(`/meta/mandis?cropId=${v}`, setMandis);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/cycles', form);
      navigate(`/cycles/${data._id || data.cycle?._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create the cycle');
    } finally {
      setLoading(false);
    }
  };

  // Build mandi options for searchable select: "Market (District, State)"
  const mandiOptions = mandis.map(m => ({
    value: m._id,
    label: `${m.market} (${m.district}, ${m.state})`,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/cycles" className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-600 hover:shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create crop cycle</h1>
          <p className="text-sm text-slate-500">Choose the exact reference data for this season.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        )}

        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-semibold text-slate-800">
          <Sprout className="h-5 w-5 text-brand-600" /> Cycle details
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* State */}
          <label className="text-sm font-semibold text-slate-700">
            State <span className="text-red-400">*</span>
            <select required value={form.stateId} onChange={(e) => stateChange(e.target.value)} className={field}>
              <option value="">Select state</option>
              {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>

          {/* District */}
          <label className="text-sm font-semibold text-slate-700">
            District <span className="text-red-400">*</span>
            <select required disabled={!form.stateId} value={form.districtId} onChange={(e) => districtChange(e.target.value)} className={field}>
              <option value="">Select district</option>
              {districts.map(d => <option key={d._id} value={d._id}>{titleCase(d.name)}</option>)}
            </select>
          </label>

          {/* Crop – shown by priceCommodity */}
          <label className="text-sm font-semibold text-slate-700">
            Crop <span className="text-red-400">*</span>
            <select required disabled={!form.districtId} value={form.cropId} onChange={(e) => cropChange(e.target.value)} className={field}>
              <option value="">Select crop</option>
              {crops.map(c => <option key={c._id} value={c._id}>{c.priceCommodity}</option>)}
            </select>
          </label>

          {/* Season */}
          <label className="text-sm font-semibold text-slate-700">
            Season <span className="text-red-400">*</span>
            <select required disabled={!form.cropId} value={form.seasonId} onChange={(e) => set('seasonId', e.target.value)} className={field}>
              <option value="">Select season</option>
              {seasons.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>

          {/* Mandi – searchable */}
          <div className="md:col-span-2">
            <p className="mb-0.5 text-sm font-semibold text-slate-700">Mandi <span className="text-red-400">*</span></p>
            <SearchableSelect
              options={mandiOptions}
              value={form.mandiId}
              onChange={(v) => set('mandiId', v)}
              placeholder="Search for a market…"
              disabled={!form.cropId}
            />
            {/* hidden input for native form validation */}
            <input tabIndex={-1} required value={form.mandiId} onChange={() => {}}
              className="absolute h-0 w-0 opacity-0" />
          </div>

          {/* Area */}
          <label className="text-sm font-semibold text-slate-700">
            Area (hectares) <span className="text-red-400">*</span>
            <input required min="0.01" step="0.01" type="number" value={form.areaHectares}
              onChange={(e) => set('areaHectares', e.target.value)} className={field} />
          </label>

          {/* Sowing date */}
          <label className="text-sm font-semibold text-slate-700">
            Sowing date <span className="text-red-400">*</span>
            <input required type="date" value={form.sowingDate}
              onChange={(e) => set('sowingDate', e.target.value)} className={field} />
          </label>
        </div>

        <button disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create cycle'}
        </button>
      </form>
    </div>
  );
}
