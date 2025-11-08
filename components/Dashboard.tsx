import React, { useState } from 'react';
import type { Session } from '../types';
import { Page } from '../types';
import Header from './Header';
import QuadrantePage from './QuadrantePage';
import RegistrosPage from './RegistrosPage';
import LojaPage from './LojaPage';
import { useAppContext } from '../contexts/AppContext';

interface DashboardProps {
  session: Session;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
  const [activePage, setActivePage] = useState<Page>(Page.Quadrante);
  const { loading } = useAppContext();

  return (
    <>
      <Header
        email={session.email}
        onLogout={onLogout}
      />
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActivePage(Page.Quadrante)}
                  className={`
                    ${activePage === Page.Quadrante
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Quadrante de Desempenho
                </button>
                <button
                  onClick={() => setActivePage(Page.Registros)}
                  className={`
                    ${activePage === Page.Registros
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Registros
                </button>
                <button
                  onClick={() => setActivePage(Page.Lojas)}
                  className={`
                    ${activePage === Page.Lojas
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Lojas
                </button>
              </nav>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg className="w-12 h-12 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-medium text-slate-700">Carregando dados...</p>
                    <p className="text-sm text-slate-500">Buscando informações no banco de dados.</p>
                </div>
              ) : (
                <>
                  {activePage === Page.Quadrante && <QuadrantePage />}
                  {activePage === Page.Registros && <RegistrosPage />}
                  {activePage === Page.Lojas && <LojaPage />}
                </>
              )}
            </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;