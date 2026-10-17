import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const save = async (event) => {
    event.preventDefault();
    const { data } = await api.put('/users/me', { name });
    updateUser(data.user || data);
    setMessage('Profile updated.');
  };
  return <div className="mx-auto max-w-xl space-y-6"><div><h1 className="text-2xl font-bold text-slate-900">Profile</h1><p className="text-sm text-slate-500">Update the name shown in FarmSync.</p></div><form onSubmit={save} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><label className="block text-sm font-medium text-slate-700">Name<input className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" required value={name} onChange={(e) => setName(e.target.value)} /></label><p className="text-sm text-slate-500">{user?.email}</p><button className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Save changes</button>{message && <p className="text-sm text-emerald-700">{message}</p>}</form></div>;
}
