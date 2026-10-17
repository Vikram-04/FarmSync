import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Loader2, Sprout } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import api from '../lib/api';
import { titleCase } from '../components/ui';

const field = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400';

export default function Register() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', farmName: '', stateId: '', districtId: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    api.get('/meta/states').then(({ data }) => setStates(data)).catch(() => setError('Unable to load states.'));
  }, []);

  const set = (key, value) => setForm(c => ({ ...c, [key]: value }));

  const stateChange = (v) => {
    set('stateId', v);
    set('districtId', '');
    setDistricts([]);
    if (v) api.get(`/meta/districts?stateId=${v}`).then(({ data }) => setDistricts(data)).catch(() => {});
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/cycles');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 px-4 py-10">
      <div className="w-full max-w-2xl animate-fade-in rounded-3xl bg-white p-7 shadow-2xl md:p-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-600">Start your season</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Create your FarmSync account</h1>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Your name <span className="text-red-400">*</span>
              <input required className={field} value={form.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email <span className="text-red-400">*</span>
              <input required type="email" className={field} value={form.email} onChange={(e) => set('email', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Password <span className="text-red-400">*</span>
              <input required minLength={6} type="password" className={field} value={form.password} onChange={(e) => set('password', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Farm name
              <input className={field} placeholder="e.g. Green Valley Farm" value={form.farmName} onChange={(e) => set('farmName', e.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              State
              <select className={field} value={form.stateId} onChange={(e) => stateChange(e.target.value)}>
                <option value="">Select state</option>
                {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              District
              <select className={field} disabled={!form.stateId} value={form.districtId} onChange={(e) => set('districtId', e.target.value)}>
                <option value="">Select district</option>
                {districts.map(d => <option key={d._id} value={d._id}>{titleCase(d.name)}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Farm address
              <textarea className={`${field} min-h-20 resize-y`} placeholder="Village, street, or local address" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </label>
          </div>

          <button disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link className="font-semibold text-brand-700 transition hover:text-brand-800" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
