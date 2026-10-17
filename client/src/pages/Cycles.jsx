import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Plus, Calendar, ArrowRight, Ruler } from 'lucide-react';
import api from '../lib/api';
import { PageLoader, ErrorBox, titleCase, shortDate } from '../components/ui';

function stageBadge(cycle) {
  if (!cycle.cropId?.durationDays) return null;
  const progress = (Date.now() - new Date(cycle.sowingDate).getTime()) / 86400000 / cycle.cropId.durationDays;
  let label, color;
  if (progress < 0) { label = 'Not yet sown'; color = 'bg-slate-100 text-slate-600'; }
  else if (progress < 0.15) { label = 'Germination'; color = 'bg-lime-50 text-lime-700 border-lime-100'; }
  else if (progress < 0.5) { label = 'Vegetative'; color = 'bg-emerald-50 text-emerald-700 border-emerald-100'; }
  else if (progress < 0.75) { label = 'Flowering'; color = 'bg-amber-50 text-amber-700 border-amber-100'; }
  else if (progress < 1) { label = 'Maturity'; color = 'bg-orange-50 text-orange-700 border-orange-100'; }
  else { label = 'Ready to harvest'; color = 'bg-brand-50 text-brand-700 border-brand-100'; }
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${color}`}>{label}</span>;
}

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cycles')
      .then(({ data }) => setCycles(data))
      .catch(() => setError('Failed to load crop cycles'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Crop Cycles</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and track your farming seasons</p>
        </div>
        <Link to="/cycles/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
          <Plus className="h-4 w-4" /> New Cycle
        </Link>
      </div>

      {/* Empty state */}
      {cycles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
            <Sprout className="h-8 w-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No crop cycles yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Create your first crop cycle to start tracking weather, expenses, revenue, and disease predictions.
          </p>
          <Link to="/cycles/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">
            <Plus className="h-4 w-4" /> Create your first cycle
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 stagger">
          {cycles.map((cycle) => (
            <Link key={cycle._id} to={`/cycles/${cycle._id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-md">
              {/* Decorative accent */}
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-50 transition-transform duration-300 group-hover:scale-150" />

              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 shadow-sm">
                    <Sprout className="h-5 w-5" />
                  </div>
                  {stageBadge(cycle)}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{cycle.cropId?.priceCommodity || 'Crop'}</h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {cycle.seasonId?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" /> {cycle.areaHectares} ha
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    Sowed {shortDate(cycle.sowingDate)}
                    {cycle.districtId?.name && ` · ${titleCase(cycle.districtId.name)}`}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 transition-transform group-hover:translate-x-1">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
