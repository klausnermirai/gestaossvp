
import React from 'react';
import { Member } from '../types';

type View = 'dashboard' | 'conference' | 'members' | 'assisted' | 'councils' | 'financial';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: Member | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isOpen, 
  setIsOpen,
  currentUser,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: '📊' },
    { id: 'councils', label: 'Conselhos', icon: '🏛️' },
    { id: 'conference', label: 'Conferências', icon: '⛪' },
    { id: 'members', label: 'Membros', icon: '👥' },
    { id: 'assisted', label: 'Famílias Assistidas', icon: '🏠' },
    { id: 'financial', label: 'Financeiro / Mapa', icon: '💰' },
  ] as const;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col shrink-0
      `}>
        <div className="flex items-center gap-3 p-6 border-b border-slate-700">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-sm shadow-md">
            SSVP
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Gestão SSVP</h1>
            <p className="text-xs text-slate-400">Sistema Integrado</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 bg-slate-800 border-b border-slate-700">
            <div className="text-sm font-bold text-white truncate">{currentUser?.name}</div>
            <div className="text-xs text-slate-400 truncate">
                {currentUser?.accessLevel === 'admin' ? 'Administrador / Conselho' : 'Membro de Conferência'}
            </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id as View);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-700 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/50 text-red-200 hover:bg-red-900 hover:text-white rounded-lg transition-colors text-sm font-medium"
          >
            Sair do Sistema
          </button>
          <div className="text-xs text-slate-500 text-center">
            <p>Louvado Seja Nosso Senhor Jesus Cristo</p>
          </div>
        </div>
      </aside>
    </>
  );
};
