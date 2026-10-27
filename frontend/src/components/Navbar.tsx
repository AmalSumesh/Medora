import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export type AppView = 'landing' | 'login' | 'register' | 'chat';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  isAuthenticated = false,
  onLogout,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-900 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-sm transition-colors">
      <div className="flex h-18 w-full items-center justify-between px-6 sm:px-10 max-w-7xl mx-auto">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate(isAuthenticated ? 'chat' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-all">
            {/* Medical Shield + Cross Icon */}
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
            </svg>
          </div>
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Medora <span className="text-emerald-500 dark:text-emerald-400">AI</span>
            </span>
          </div>
        </div>

        {/* Navigation Actions & Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {userName && (
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 sm:inline-block">
                  {userName}
                </span>
              )}
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
              >
                Chat
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="rounded-xl px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer active:scale-95"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

