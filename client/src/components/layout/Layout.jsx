import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Sprout, User, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'My Cycles', href: '/cycles', icon: Sprout },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Mobile top bar ─── */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-lg">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">FarmSync</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ─── Mobile overlay ─── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <nav className="absolute left-0 top-16 bottom-0 flex w-72 flex-col bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex-1 space-y-1 overflow-y-auto p-4">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={label} to={href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-slate-100 p-4">
              <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50">
                <LogOut className="h-5 w-5" /> Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-[17rem] lg:flex-col">
        <div className="flex flex-1 flex-col border-r border-slate-200/80 bg-white">
          {/* Logo */}
          <Link to="/" className="flex h-20 items-center gap-3 px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-[1.35rem] font-bold tracking-tight text-slate-900">FarmSync</span>
          </Link>

          {/* User card */}
          <div className="mx-5 rounded-2xl border border-brand-100/60 bg-brand-50/40 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-2 ring-brand-200/50">
                {user?.name?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name || 'Farmer'}</p>
                <p className="truncate text-xs text-brand-600">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-6 flex-1 space-y-1 px-4">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={label} to={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-200/40'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  <Icon className={`h-5 w-5 transition ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4">
            <button onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-5 w-5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex min-h-screen flex-col lg:pl-[17rem]">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
