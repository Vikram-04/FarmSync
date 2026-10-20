import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CloudRain, CloudSun, FileText, IndianRupee, Loader2, ShieldCheck, Sprout, Trash2, Wind } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../lib/api';

const card = 'rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200';
const money = (value) => value == null ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
const today = new Date().toISOString().slice(0, 10);
const cropStages = ['Not yet sown', 'Germination', 'Vegetative', 'Flowering', 'Maturity', 'Ready to harvest'];
const imageBaseUrl = api.defaults.baseURL.replace(/\/api\/?$/, '');
const diseaseSupportedCrops = ['maize', 'grapes', 'potato', 'tomato'];

function Loading() { return <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-emerald-600" /></div>; }

function Weather({ weather }) {
  return <div className={`${card} md:col-span-2 lg:col-span-4`}>
    <div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-medium text-sky-600">Live forecast</p><h2 className="text-xl font-bold text-slate-900">Next 7 days</h2></div><CloudSun className="h-8 w-8 text-sky-500" /></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{(weather?.forecast || []).map((day) => <div key={day.date} className="rounded-2xl bg-sky-50 p-3 text-center"><p className="text-xs font-semibold text-slate-500">{dateLabel(day.date)}</p><p className="mt-2 text-lg font-bold text-slate-900">{Math.round(day.maxTemperature)}°</p><p className="text-xs text-slate-500">{Math.round(day.minTemperature)}° low</p><div className="mt-3 flex justify-center gap-2 text-xs text-slate-500"><span title="Rain"><CloudRain className="h-3.5 w-3.5" />{Math.round(day.rain)}mm</span><span title="Wind"><Wind className="h-3.5 w-3.5" />{Math.round(day.maxWind)}</span></div>{day.warnings.length > 0 && <p className="mt-2 text-[10px] font-semibold text-amber-700">{day.warnings.join(' · ')}</p>}</div>)}</div>
    <div className={`mt-4 rounded-2xl p-4 text-sm ${weather?.warnings?.length ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}><strong>Weather warnings:</strong> {weather?.warnings?.length ? weather.warnings.join(' · ') : 'No warnings'}</div>
  </div>;
}

function StageScale({ currentStage }) {
  const currentIndex = Math.max(0, cropStages.indexOf(currentStage));
  return <div className="mt-4 overflow-x-auto pb-1">
    <div className="min-w-[560px]">
      <div className="relative mx-5 h-8">
        <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-slate-200" />
        <div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-emerald-500 transition-all" style={{ width: `${currentIndex / (cropStages.length - 1) * 100}%` }} />
        <div className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-700 shadow-md transition-all" style={{ left: `${currentIndex / (cropStages.length - 1) * 100}%` }} />
      </div>
      <div className="relative mx-5 mt-3 h-12 text-center">
        {cropStages.map((stageName, index) => <div key={stageName} className={`absolute top-0 w-24 ${index === 0 ? 'text-left' : index === cropStages.length - 1 ? '-translate-x-full text-right' : '-translate-x-1/2'} ${index <= currentIndex ? 'text-emerald-700' : 'text-slate-400'}`} style={{ left: `${index / (cropStages.length - 1) * 100}%` }}>
          <p className="text-xs font-semibold">{stageName}</p>
          <p className="mt-1 text-[10px]">{index === currentIndex ? 'Current' : index < currentIndex ? 'Complete' : 'Upcoming'}</p>
        </div>)}
      </div>
    </div>
  </div>;
}

function Overview({ cycle }) {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get(`/cycles/${cycle._id}/dashboard`).then(({ data: result }) => setData(result)).catch(() => setError('Unable to load the dashboard.')); }, [cycle._id]);
  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!data) return <Loading />;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div className={`${card} md:col-span-2 lg:col-span-4`}><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Crop stage</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.stage}</p><p className="mt-1 text-xs text-slate-500">Sowing date: {dateLabel(cycle.sowingDate)}</p></div><Sprout className="h-7 w-7 text-emerald-600" /></div><StageScale currentStage={data.stage} /></div>
    <div className={card}><p className="text-sm text-slate-500">Predicted yield</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.predictedYield} t/ha</p><p className="mt-1 text-xs text-slate-500">{data.predictedProduction} tonnes production</p></div>
    <div className={card}><p className="text-sm text-slate-500">Current price</p><p className="mt-2 text-2xl font-bold text-slate-900">{money(data.currentPrice)}</p><p className="mt-1 text-xs text-slate-500">{data.arrivalDate ? `As of ${dateLabel(data.arrivalDate)}` : 'Price unavailable'}</p><div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">Market</p><p className="mt-1 font-semibold text-slate-900">{cycle.mandiId?.market || '—'}</p></div></div>
    <div className={card}><p className="text-sm text-slate-500">Current revenue</p><p className="mt-2 text-2xl font-bold text-emerald-700">{money(data.currentRevenue)}</p><p className="mt-1 text-xs text-slate-500">{data.predictedProduction} tonnes predicted</p></div>
    <div className={card}><p className="text-sm text-slate-500">Actual profit</p><p className="mt-2 text-2xl font-bold text-slate-900">{money(data.actualProfit)}</p><p className="mt-1 text-xs text-slate-500">{money(data.totalSales)} sales · {money(data.totalExpenses)} expenses</p></div>
    <Weather weather={data.weather} />
    <div className={`${card} md:col-span-2`}><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" /><div><p className="text-sm text-slate-500">Latest disease result</p><p className="font-bold text-slate-900">{data.diseaseSupported ? (data.latestDisease?.disease || 'No prediction yet') : 'Unavailable for this crop'}</p></div></div>{data.latestDisease && <p className="mt-3 text-sm text-slate-500">{data.latestDisease.confidence != null ? `${Math.round(data.latestDisease.confidence * 100)}% confidence · ` : ''}{dateLabel(data.latestDisease.createdAt)}</p>}</div>
  </div>;
}

function Estimate({ cycle }) {
  const [estimate, setEstimate] = useState(null); const [history, setHistory] = useState([]); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api.get(`/cycles/${cycle._id}/estimate`), api.get(`/cycles/${cycle._id}/price-history`)]).then(([estimateResponse, historyResponse]) => { setEstimate(estimateResponse.data); setHistory(historyResponse.data); }).catch(() => setError('Unable to load estimations.')); }, [cycle._id]);
  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!estimate) return <Loading />;
  const values = [['Predicted yield', `${estimate.predictedYield} t/ha`], ['Area', `${estimate.areaHectares} ha`], ['Production', `${estimate.predictedProduction} tonnes`], ['Current price', money(estimate.currentPrice)], ['Current revenue', money(estimate.currentRevenue)]];
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{values.map(([label, value]) => <div className={card} key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>{label === 'Current price' && estimate.arrivalDate && <p className="mt-1 text-xs text-slate-500">As of {dateLabel(estimate.arrivalDate)}</p>}</div>)}</div><div className={card}><div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-emerald-600">Mandi history</p><h2 className="text-xl font-bold">Price since cycle creation</h2></div><IndianRupee className="text-emerald-600" /></div><div className="h-72">{history.length ? <ResponsiveContainer><LineChart data={history}><XAxis dataKey="fetchDate" /><YAxis /><Tooltip /><Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} /></LineChart></ResponsiveContainer> : <p className="flex h-full items-center justify-center text-sm text-slate-500">No price history yet.</p>}</div></div></div>;
}

function Disease({ cycle }) {
  const [history, setHistory] = useState([]); const [file, setFile] = useState(null); const [state, setState] = useState({ loading: false, error: '', success: '' });
  const supported = diseaseSupportedCrops.includes(String(cycle.cropId?.name).trim().toLowerCase());
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(`/cycles/${cycle._id}/disease`);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setState((current) => ({ ...current, error: 'Unable to load prediction history.' }));
    }
  }, [cycle._id]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const submit = async (event) => { event.preventDefault(); setState({ loading: true, error: '', success: '' }); const body = new FormData(); body.append('image', file); try { await api.post(`/cycles/${cycle._id}/disease`, body); setFile(null); setState({ loading: false, error: '', success: 'Prediction added.' }); await refresh(); } catch (error) { setState({ loading: false, error: error.response?.data?.message || 'Prediction failed.', success: '' }); } };
  return <div className="space-y-5">{supported ? <form onSubmit={submit} className={card}><div className="mb-4 flex items-center gap-3"><ShieldCheck className="text-emerald-600" /><div><h2 className="font-bold text-slate-900">Upload a crop image</h2><p className="text-sm text-slate-500">Powered by the FarmSync disease model.</p></div></div><input required type="file" accept="image/*" onChange={(event) => setFile(event.target.files[0])} className="block w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm" /><button disabled={state.loading} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-60">{state.loading ? 'Predicting…' : 'Predict disease'}</button>{state.error && <p className="mt-3 text-sm text-red-700">{state.error}</p>}{state.success && <p className="mt-3 text-sm text-emerald-700">{state.success}</p>}</form> : <div className={`${card} bg-amber-50 text-amber-900`}><h2 className="font-bold">Disease prediction unavailable for this crop</h2><p className="mt-1 text-sm">The model currently supports maize, grapes, potato, and tomato.</p></div>}<div className={card}><h2 className="mb-3 font-bold text-slate-900">Prediction history</h2>{history.length ? history.map((item) => <div className="flex gap-4 border-t border-slate-100 py-4 text-sm" key={item._id}><img src={`${imageBaseUrl}${item.imageUrl}`} alt={`Uploaded crop for ${item.disease}`} className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200" /><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{item.disease}</p><p className="mt-1 text-slate-500">{item.confidence != null ? `${Math.round(item.confidence * 100)}% confidence · ` : ''}{dateLabel(item.createdAt)}</p></div></div>) : <p className="text-sm text-slate-500">No predictions yet.</p>}</div></div>;
}

function Finances({ cycle }) {
  const [summary, setSummary] = useState(null); const [kind, setKind] = useState('expenses'); const [error, setError] = useState(''); const [form, setForm] = useState({ category: 'seeds', amount: '', pricePerQuintal: '', date: today, note: '' });
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(`/cycles/${cycle._id}/finance-summary`);
      setSummary(data);
    } catch {
      setError('Unable to load finance summary.');
    }
  }, [cycle._id]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const submit = async (event) => { event.preventDefault(); setError(''); const amount = Number(form.amount); const price = Number(form.pricePerQuintal); if (amount <= 0 || (kind === 'sales' && price <= 0)) return setError('Enter positive values for all amounts.'); const payload = kind === 'sales' ? { quantity: amount, pricePerQuintal: price, buyer: form.note, date: form.date } : { category: form.category, amount, date: form.date, note: form.note }; try { await api.post(`/cycles/${cycle._id}/${kind}`, payload); setForm({ ...form, amount: '', pricePerQuintal: '', note: '' }); refresh(); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to add entry.'); } };
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3">{[['Total expenses', summary?.totalExpenses], ['Total sales', summary?.totalSales], ['Actual profit', summary?.actualProfit]].map(([label, value]) => <div className={card} key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{money(value)}</p></div>)}</div><form onSubmit={submit} className={`${card} grid gap-3 md:grid-cols-2 lg:grid-cols-4`}><select className="rounded-xl border border-slate-200 p-3" value={kind} onChange={(event) => setKind(event.target.value)}><option value="expenses">Expense</option><option value="sales">Sale</option></select>{kind === 'expenses' && <select className="rounded-xl border border-slate-200 p-3" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{['seeds', 'fertilizer', 'pesticide', 'labour', 'irrigation', 'machinery', 'other'].map((category) => <option key={category}>{category}</option>)}</select>}<input className="rounded-xl border border-slate-200 p-3" placeholder={kind === 'sales' ? 'Quantity (quintals)' : 'Amount'} type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />{kind === 'sales' && <input className="rounded-xl border border-slate-200 p-3" placeholder="Price/quintal" type="number" min="0.01" step="0.01" required value={form.pricePerQuintal} onChange={(event) => setForm({ ...form, pricePerQuintal: event.target.value })} />}<input className="rounded-xl border border-slate-200 p-3" placeholder={kind === 'sales' ? 'Buyer' : 'Note'} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /><button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Add entry</button>{error && <p className="text-sm text-red-700 md:col-span-2 lg:col-span-4">{error}</p>}</form></div>;
}

export default function CycleDetail() {
  const { id } = useParams(); const location = useLocation(); const navigate = useNavigate(); const [cycle, setCycle] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get(`/cycles/${id}`).then(({ data }) => setCycle(data.cycle || data)).catch(() => setError('Unable to load this cycle.')); }, [id]);
  if (error) return <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!cycle) return <Loading />;
  const deleteCycle = async () => { if (window.confirm('Delete this crop cycle and its records?')) { await api.delete(`/cycles/${id}`); navigate('/cycles'); } };
  const tabs = [['', 'Dashboard', CloudSun], ['estimate', 'Estimations', IndianRupee], ['disease', 'Disease', ShieldCheck], ['finances', 'Finances', FileText]];
  const activeTab = location.pathname.endsWith('/estimate') ? 'estimate' : location.pathname.endsWith('/disease') ? 'disease' : location.pathname.endsWith('/finances') ? 'finances' : '';
  const content = activeTab === 'estimate' ? <Estimate cycle={cycle} /> : activeTab === 'disease' ? <Disease cycle={cycle} /> : activeTab === 'finances' ? <Finances cycle={cycle} /> : <Overview cycle={cycle} />;
  return <div className="space-y-6"><header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl md:p-8"><Link to="/cycles" className="mb-5 inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> All cycles</Link><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-sm text-emerald-300"><Sprout className="h-4 w-4" /> Crop cycle</p><h1 className="text-3xl font-bold">{cycle.cropId?.priceCommodity}</h1><p className="mt-2 text-slate-300">{cycle.seasonId?.name} · {cycle.districtId?.name} · {cycle.areaHectares} hectares</p><p className="mt-2 text-sm text-emerald-200">Market: {cycle.mandiId?.market || '—'}</p></div><button onClick={deleteCycle} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm text-red-200 hover:bg-white/10"><Trash2 className="h-4 w-4" /> Delete cycle</button></div></header><nav className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">{tabs.map(([path, label, Icon]) => <NavLink end={!path} key={label} to={`/cycles/${cycle._id}${path ? `/${path}` : ''}`} className={({ isActive }) => `inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav>{content}</div>;
}
