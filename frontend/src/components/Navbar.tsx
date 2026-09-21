import React from 'react';

interface NavbarProps {
  currentView: 'login' | 'register' | 'chat';
  onNavigate: (view: 'login' | 'register' | 'chat') => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAuthenticated = false,
  onLogout,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm transition-all">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate(isAuthenticated ? 'chat' : 'login')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-700/20 group-hover:bg-teal-700 transition-colors">
            {/* Medical Shield + Cross Icon */}
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Medora
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 border border-teal-100">
                Clinical AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Intelligent Health Triage & Guidance
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {userName && (
                <span className="hidden text-sm font-medium text-slate-800 sm:inline-block">
                  {userName}
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  currentView === 'login'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  currentView === 'register'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100/80 border border-teal-200/60'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
