import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Navbar, type AppView } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Chat } from './pages/Chat';

function MainApp() {
  const { isAuthenticated, user, logout } = useAuth();

  const [requestedView, setRequestedView] = useState<AppView>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/register') return 'register';
    if (path === '/login') return 'login';
    if (path === '/chat') return 'chat';
    return 'landing';
  });

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/register') {
        setRequestedView('register');
      } else if (path === '/login') {
        setRequestedView('login');
      } else if (path === '/chat') {
        setRequestedView('chat');
      } else {
        setRequestedView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: AppView) => {
    setRequestedView(view);
    const targetPath = view === 'landing' ? '/' : `/${view}`;
    window.history.pushState(null, '', targetPath);
  };

  // Derive active view
  const activeView: AppView = !isAuthenticated
    ? requestedView === 'chat'
      ? 'login'
      : requestedView
    : requestedView === 'login' || requestedView === 'register'
      ? 'chat'
      : requestedView;

  return (
    <div
      className={`${
        activeView === 'landing' ? 'h-screen overflow-hidden' : 'min-h-screen'
      } bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 transition-colors`}
    >
      {/* Navigation Header */}
      <Navbar
        currentView={activeView}
        onNavigate={navigateTo}
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          logout();
          navigateTo('landing');
        }}
        userName={user?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeView === 'landing' && (
          <Landing
            onGetStarted={() => navigateTo(isAuthenticated ? 'chat' : 'register')}
          />
        )}

        {activeView === 'login' && (
          <Login
            onNavigateToRegister={() => navigateTo('register')}
            onLoginSuccess={() => navigateTo('chat')}
          />
        )}

        {activeView === 'register' && (
          <Register onNavigateToLogin={() => navigateTo('login')} />
        )}

        {activeView === 'chat' && <Chat />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
