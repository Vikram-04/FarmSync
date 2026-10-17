import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/cycles');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-emerald-900/10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
            <Sprout className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Join FarmSync</h1>
          <p className="mt-2 text-sm text-slate-500">Keep every crop cycle in one place.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {[
            ['name', 'Name', 'Your name', 'text'],
            ['email', 'Email', 'farmer@example.com', 'email'],
            ['password', 'Password', 'At least 6 characters', 'password'],
          ].map(([name, label, placeholder, type]) => (
            <label key={name} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                required
                minLength={name === 'password' ? 6 : undefined}
                type={type}
                value={form[name]}
                placeholder={placeholder}
                onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          ))}
          <button disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-emerald-700" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
