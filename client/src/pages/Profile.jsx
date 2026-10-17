import { useEffect, useState } from 'react';
import { MapPin, Save, UserRound, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { titleCase } from '../components/ui';

const field = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export default function Profile() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({ name: '', farmName: '', stateId: '', districtId: '', address: '' });
  const [status, setStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    Promise.all([api.get('/users/me'), api.get('/meta/states')]).then(([u, s]) => {
      const user = u.data;
      setForm({
        name: user.name || '',
        farmName: user.farmName || '',
        stateId: user.stateId?._id || '',
        districtId: user.districtId?._id || '',
        address: user.address || '',
      });
      setStates(s.data);
      if (user.stateId?._id) api.get(`/meta/districts?stateId=${user.stateId._id}`).then(({ data }) => setDistricts(data));
    }).catch(() => setStatus({ error: 'Unable to load your profile.', success: '' }));
  }, []);

  const set = (key, value) => setForm(c => ({ ...c, [key]: value }));

  const stateChange = (v) => {
    set('stateId', v);
    set('districtId', '');
    setDistricts([]);
    if (v) api.get(`/meta/districts?stateId=${v}`).then(({ data }) => setDistricts(data));
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });
    try {
      await api.put('/users/me', form);
      setStatus({ error: '', success: 'Profile saved successfully.' });
    } catch (err) {
      setStatus({ error: err.response?.data?.message || 'Unable to save your profile.', success: '' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <header className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500 p-7 text-white shadow-xl shadow-brand-900/10 md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-100">Your farmer profile</p>
            <h1 className="text-2xl font-bold md:text-3xl">Tell us about your farm</h1>
          </div>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-100/90">
          Keep your details up to date so new crop cycles start with the right location.
        </p>
      </header>

      {/* Form */}
      <form onSubmit={submit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        {status.error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{status.error}</div>
        )}
        {status.success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
            <CheckCircle2 className="h-4 w-4" /> {status.success}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Your name
            <input className={field} required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Farm name
            <input className={field} value={form.farmName} onChange={(e) => set('farmName', e.target.value)} placeholder="e.g. Green Valley Farm" />
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
            <textarea className={`${field} min-h-24 resize-y`} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Village, street, or any useful location detail" />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
            <Save className="h-4 w-4" /> Save profile
          </button>
        </div>
      </form>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
        Your saved state and district are used to prefill the next cycle form. You can still change them for each cycle.
      </div>
    </div>
  );
}
