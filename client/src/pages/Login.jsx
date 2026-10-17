import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import api from '../lib/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/cycles');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ─── Left hero panel ─── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-teal-600 p-12 lg:flex lg:flex-col lg:justify-between">
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/[0.07]" />
        <div className="absolute -left-16 bottom-20 h-64 w-64 rounded-full bg-white/[0.05]" />
        <div className="absolute right-20 bottom-40 h-40 w-40 rounded-full bg-white/[0.04]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FarmSync</span>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-brand-200">
            Grow with confidence
          </p>
          <h1 className="text-5xl font-bold leading-[1.15] text-white">
            Your farm decisions, in one clear view.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-100/90">
            Track crop cycles, understand weather, follow mandi prices, and measure what your season really earns.
          </p>
        </div>

        <p className="relative text-sm text-brand-200/80">
          Simple tools for every growing season.
        </p>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-brand-700">FarmSync</span>
          </div>

          <div className="mb-9">
            <p className="text-sm font-semibold text-brand-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to your farm</h2>
            <p className="mt-2 text-slate-500">Continue where you left off.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input required type="email" placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input required type="password" placeholder="Your password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </label>

            <button disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            New to FarmSync?{' '}
            <Link className="font-semibold text-brand-700 transition hover:text-brand-800" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
