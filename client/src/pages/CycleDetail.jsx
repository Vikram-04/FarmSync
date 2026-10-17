import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CloudSun, FileText, IndianRupee, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../lib/api';

const card = 'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100';
const money = (value) => value == null ? '—' : `₹${Number(value).toLocaleString('en-IN')}`;

function Overview({ cycle }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/cycles/${cycle._id}/dashboard`).then(({ data: result }) => setData(result)); }, [cycle._id]);
  if (!data) return <Loader2 className="animate-spin text-emerald-600" />;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div className={card}><p className="text-sm text-slate-500">Crop stage</p><p className="mt-2 text-xl font-bold">{data.stage || '—'}</p></div>
    <div className={card}><p className="text-sm text-slate-500">Current price</p><p className="mt-2 text-xl font-bold">{money(data.currentPrice ?? data.price?.price)}</p><p className="text-xs text-slate-400">{data.arrivalDate ? `As of ${data.arrivalDate}` : 'Price unavailable'}</p></div>
    <div className={card}><p className="text-sm text-slate-500">Current revenue</p><p className="mt-2 text-xl font-bold">{money(data.currentRevenue)}</p></div>
    <div className={card}><p className="text-sm text-slate-500">Finance snapshot</p><p className="mt-2 text-xl font-bold">{money(data.actualProfit ?? data.finance?.actualProfit)}</p><p className="text-xs text-slate-400">Actual profit</p></div>
    <div className={`${card} md:col-span-2 lg:col-span-4`}><div className="flex items-center gap-2 font-semibold"><CloudSun className="text-sky-500" /> Weather</div><p className="mt-3 text-sm text-slate-600">{data.weather?.warnings?.length ? data.weather.warnings.join(' ') : 'No warnings reported.'}</p></div>
  </div>;
}

function Estimate({ cycle }) {
  const [estimate, setEstimate] = useState(null);
  const [history, setHistory] = useState([]);
  useEffect(() => { Promise.all([api.get(`/cycles/${cycle._id}/estimate`), api.get(`/cycles/${cycle._id}/price-history`)]).then(([a, b]) => { setEstimate(a.data); setHistory(b.data); }); }, [cycle._id]);
  if (!estimate) return <Loader2 className="animate-spin text-emerald-600" />;
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[['Predicted yield', `${estimate.predictedYield ?? '—'} t/ha`], ['Area', `${estimate.areaHectares ?? '—'} ha`], ['Production', `${estimate.predictedProduction ?? '—'} tonnes`], ['Current price', money(estimate.currentPrice)], ['Current revenue', money(estimate.currentRevenue)]].map(([label, value]) => <div className={card} key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div><div className={card}><h2 className="mb-4 font-semibold">Price since cycle creation</h2><div className="h-72"><ResponsiveContainer><LineChart data={history}><XAxis dataKey="fetchDate" /><YAxis /><Tooltip /><Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} /></LineChart></ResponsiveContainer></div></div></div>;
}

function Disease({ cycle }) {
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const refresh = () => api.get(`/cycles/${cycle._id}/disease`).then(({ data }) => setHistory(data));
  useEffect(refresh, [cycle._id]);
  const submit = async (event) => { event.preventDefault(); const body = new FormData(); body.append('image', file); await api.post(`/cycles/${cycle._id}/disease`, body); setFile(null); setMessage('Prediction added.'); refresh(); };
  return <div className="space-y-5"><form onSubmit={submit} className={card}><h2 className="mb-3 font-semibold">Upload a crop image</h2><input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /><button className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Predict disease</button>{message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}</form><div className={card}><h2 className="mb-3 font-semibold">Prediction history</h2>{history.map((item) => <div className="flex justify-between border-t border-slate-100 py-3 text-sm" key={item._id}><span>{item.disease}</span><span className="text-slate-500">{item.confidence ? `${item.confidence}% · ` : ''}{new Date(item.createdAt).toLocaleDateString()}</span></div>)}</div></div>;
}

function Finances({ cycle }) {
  const [summary, setSummary] = useState(null);
  const [kind, setKind] = useState('expenses');
  const [form, setForm] = useState({ category: 'seeds', amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const refresh = () => api.get(`/cycles/${cycle._id}/finance-summary`).then(({ data }) => setSummary(data));
  useEffect(refresh, [cycle._id]);
  const submit = async (event) => { event.preventDefault(); const payload = kind === 'sales' ? { quantity: Number(form.amount), pricePerQuintal: Number(form.pricePerQuintal || 0), buyer: form.note } : { ...form, amount: Number(form.amount) }; await api.post(`/cycles/${cycle._id}/${kind}`, payload); setForm({ ...form, amount: '', note: '' }); refresh(); };
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3">{[['Total expenses', summary?.totalExpenses], ['Total sales', summary?.totalSales], ['Actual profit', summary?.actualProfit]].map(([label, value]) => <div className={card} key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{money(value)}</p></div>)}</div><form onSubmit={submit} className={`${card} grid gap-3 md:grid-cols-4`}><select className="rounded-xl border p-3" value={kind} onChange={(e) => setKind(e.target.value)}><option value="expenses">Expense</option><option value="sales">Sale</option></select><input className="rounded-xl border p-3" placeholder={kind === 'sales' ? 'Quantity (quintals)' : 'Amount'} type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />{kind === 'sales' && <input className="rounded-xl border p-3" placeholder="Price/quintal" type="number" required value={form.pricePerQuintal || ''} onChange={(e) => setForm({ ...form, pricePerQuintal: e.target.value })} />}<input className="rounded-xl border p-3" placeholder={kind === 'sales' ? 'Buyer' : 'Note'} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /><button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Add entry</button></form></div>;
}

export default function CycleDetail() {
  const { id } = useParams(); const navigate = useNavigate(); const [cycle, setCycle] = useState(null);
  useEffect(() => { api.get(`/cycles/${id}`).then(({ data }) => setCycle(data.cycle || data)); }, [id]);
  if (!cycle) return <Loader2 className="animate-spin text-emerald-600" />;
  const deleteCycle = async () => { if (window.confirm('Delete this crop cycle and its records?')) { await api.delete(`/cycles/${id}`); navigate('/cycles'); } };
  const tabs = [['', 'Dashboard', CloudSun], ['estimate', 'Estimations', IndianRupee], ['disease', 'Disease', ShieldCheck], ['finances', 'Finances', FileText]];
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><Link to="/cycles" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500"><ArrowLeft className="h-4 w-4" /> All cycles</Link><h1 className="text-3xl font-bold text-slate-900">{cycle.crop?.priceCommodity || cycle.crop}</h1><p className="text-slate-500">{cycle.season?.name || cycle.season} · {cycle.areaHectares} ha</p></div><button onClick={deleteCycle} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button></div><nav className="flex gap-2 overflow-x-auto border-b border-slate-200">{tabs.map(([path, label, Icon]) => <NavLink end={!path} key={label} to={path} className={({ isActive }) => `inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${isActive ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav><Routes><Route index element={<Overview cycle={cycle} />} /><Route path="estimate" element={<Estimate cycle={cycle} />} /><Route path="disease" element={<Disease cycle={cycle} />} /><Route path="finances" element={<Finances cycle={cycle} />} /></Routes></div>;
}
