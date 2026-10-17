import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }) {
  return <Loader2 className={`h-6 w-6 animate-spin text-brand-600 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, accent = false }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {Icon && <Icon className={`h-5 w-5 ${accent ? 'text-brand-500' : 'text-slate-300'}`} />}
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accent ? 'text-brand-700' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

/** Format ₹ value */
export const money = (v) =>
  v == null ? '—' : `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/** Format date for display */
export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Short date – no year */
export const shortDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

/** Title-case a string: "BELGAUM" → "Belgaum" */
export const titleCase = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
