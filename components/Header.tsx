import React from 'react';
import { LogoutIcon, StoreIcon } from './icons';

interface HeaderProps {
  email: string;
  onLogout: () => void;
  onNavigateToLojas: () => void;
}

const Header: React.FC<HeaderProps> = ({ email, onLogout, onNavigateToLojas }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">Hora do Pastel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden text-sm text-slate-600 md:block">
              Logado como: <span className="font-medium text-slate-800">{email}</span>
            </span>
            <button
              onClick={onNavigateToLojas}
              className="inline-flex items-center p-2 text-sm font-medium text-gray-600 bg-gray-100 border border-transparent rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              title="Gerenciar Lojas"
            >
              <StoreIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center p-2 text-sm font-medium text-gray-600 bg-gray-100 border border-transparent rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              title="Sair"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;