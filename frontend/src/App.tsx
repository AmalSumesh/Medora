import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Chat } from './pages/Chat';

type AppView = 'login' | 'register' | 'chat';

function MainApp() {
  const { isAuthenticated, user, logout } = useAuth();

  const [requestedView, setRequestedView] = useState<AppView>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/register') return 'register';
    if (path === '/chat') return 'chat';
    return 'login';
  });

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/register') {
        setRequestedView('register');
      } else if (path === '/chat') {
        setRequestedView('chat');
      } else {
        setRequestedView('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: AppView) => {
    setRequestedView(view);
    const targetPath = view === 'login' ? '/' : `/${view}`;
    window.history.pushState(null, '', targetPath);
  };

  // Derive active view: if user wants chat but is unauthenticated, show login; if user is authenticated and on login/register, show chat
  const activeView: AppView = !isAuthenticated
    ? requestedView === 'chat'
      ? 'login'
      : requestedView
    : requestedView === 'login' || requestedView === 'register'
      ? 'chat'
      : requestedView;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900/60 dark:selection:text-teal-200 transition-colors">
      {/* Navigation Header */}
      <Navbar
        currentView={activeView}
        onNavigate={navigateTo}
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          logout();
          navigateTo('login');
        }}
        userName={user?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
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
