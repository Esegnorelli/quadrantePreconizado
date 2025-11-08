import React from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Session } from './types';
import { AppContextProvider } from './contexts/AppContext';
import { ToastProvider } from './components/common/ToastProvider';

function App() {
  const [session, setSession] = useLocalStorage<Session>('session', { loggedIn: false, email: '' });

  const handleLogin = (email: string) => {
    setSession({ loggedIn: true, email });
  };

  const handleLogout = () => {
    setSession({ loggedIn: false, email: '' });
  };

  if (!session.loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppContextProvider>
      <ToastProvider />
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Dashboard
          session={session}
          onLogout={handleLogout}
        />
      </div>
    </AppContextProvider>
  );
}

export default App;