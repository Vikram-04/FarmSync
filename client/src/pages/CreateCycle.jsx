import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sprout } from 'lucide-react';
import api from '../lib/api';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50';

export default function CreateCycle() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [crops, setCrops] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [form, setForm] = useState({ stateId: '', districtId: '', cropId: '', seasonId: '', mandiId: '', areaHectares: '', sowingDate: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/meta/states').then(({ data }) => setStates(data)).catch(() => setError('Unable to load states'));
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const load = async (url, setter) => {
    try { const { data } = await api.get(url); setter(data); } catch { setError('Unable to load the next selection'); }
  };
  const stateChange = (value) => {
    update('stateId', value);
    setDistricts([]); setCrops([]); setSeasons([]); setMandis([]);
    update('districtId', ''); update('cropId', ''); update('seasonId', ''); update('mandiId', '');
    if (value) load(`/meta/districts?stateId=${value}`, setDistricts);
  };
  const districtChange = (value) => {
    update('districtId', value); setCrops([]); setSeasons([]); setMandis([]);
    update('cropId', ''); update('seasonId', ''); update('mandiId', '');
    if (value) load(`/meta/crops?districtId=${value}`, setCrops);
  };
  const cropChange = (value) => {
    update('cropId', value); setSeasons([]); setMandis([]); update('seasonId', ''); update('mandiId', '');
    if (value) {
      load(`/meta/seasons?districtId=${form.districtId}&cropId=${value}`, setSeasons);
      load(`/meta/mandis?cropId=${value}`, setMandis);
    }
  };
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post('/cycles', form);
      navigate(`/cycles/${data.cycle?._id || data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create the cycle');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/cycles" className="rounded-xl p-2 text-slate-500 hover:bg-white"><ArrowLeft /></Link>
        <div><h1 className="text-2xl font-bold text-slate-900">Create crop cycle</h1><p className="text-sm text-slate-500">Choose the exact reference data for this season.</p></div>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-slate-900"><Sprout className="text-emerald-600" /> Cycle details</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">State<select required value={form.stateId} onChange={(e) => stateChange(e.target.value)} className={`${inputClass} mt-1`}><option value="">Select state</option>{states.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">District<select required disabled={!form.stateId} value={form.districtId} onChange={(e) => districtChange(e.target.value)} className={`${inputClass} mt-1`}><option value="">Select district</option>{districts.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Crop<select required disabled={!form.districtId} value={form.cropId} onChange={(e) => cropChange(e.target.value)} className={`${inputClass} mt-1`}><option value="">Select crop</option>{crops.map((item) => <option key={item._id} value={item._id}>{item.priceCommodity}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Season<select required disabled={!form.cropId} value={form.seasonId} onChange={(e) => update('seasonId', e.target.value)} className={`${inputClass} mt-1`}><option value="">Select season</option>{seasons.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Mandi<select required disabled={!form.cropId} value={form.mandiId} onChange={(e) => update('mandiId', e.target.value)} className={`${inputClass} mt-1`}><option value="">Select market</option>{mandis.map((item) => <option key={item._id} value={item._id}>{item.market} ({item.district}, {item.state})</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Area (hectares)<input required min="0.01" step="0.01" type="number" value={form.areaHectares} onChange={(e) => update('areaHectares', e.target.value)} className={`${inputClass} mt-1`} /></label>
          <label className="text-sm font-medium text-slate-700">Sowing date<input required type="date" value={form.sowingDate} onChange={(e) => update('sowingDate', e.target.value)} className={`${inputClass} mt-1`} /></label>
        </div>
        <button disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : 'Create cycle'}</button>
      </form>
    </div>
  );
}
