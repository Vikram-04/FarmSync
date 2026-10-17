import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * Searchable select — used for the mandi dropdown where the list can be long.
 * Falls back to a plain display when there are fewer than 8 options.
 */
export default function SearchableSelect({ options = [], value, onChange, placeholder = 'Search…', disabled = false, renderOption }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button type="button" disabled={disabled}
        onClick={() => { setOpen(!open); setQuery(''); }}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition
          ${open ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'}
          ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'hover:border-slate-300'}`}>
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selected && !disabled && (
            <span onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
              className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 animate-fade-in">
          <div className="relative border-b border-slate-100 px-3 py-2">
            <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="w-full rounded-lg bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400" />
          </div>
          <ul className="combobox-list p-1.5">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">No matches found</li>
            )}
            {filtered.map(o => (
              <li key={o.value}>
                <button type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition
                    ${o.value === value ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {renderOption ? renderOption(o) : o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
