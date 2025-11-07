import React, { useState } from 'react';
import type { Session } from '../types';
import { Page } from '../types';
import Header from './Header';
import QuadrantePage from './QuadrantePage';
import RegistrosPage from './RegistrosPage';
import LojaPage from './LojaPage';

interface DashboardProps {
  session: Session;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ session, onLogout }) => {
  const [activePage, setActivePage] = useState<Page>(Page.Quadrante);

  return (
    <>
      <Header
        email={session.email}
        onLogout={onLogout}
        onNavigateToLojas={() => setActivePage(Page.Lojas)}
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
                  Quadrante Preconizado
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
              {activePage === Page.Quadrante && <QuadrantePage />}
              {activePage === Page.Registros && <RegistrosPage />}
              {activePage === Page.Lojas && <LojaPage />}
            </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;