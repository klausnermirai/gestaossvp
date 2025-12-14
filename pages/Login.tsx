
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (cpf: string, pass: string) => void;
  isLoading: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onLogin(cpf, password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-blue-800 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl shadow-lg mx-auto mb-4">
                SSVP
            </div>
            <h1 className="text-2xl font-bold text-white">Sistema de Gestão</h1>
            <p className="text-blue-200 text-sm">Sociedade de São Vicente de Paulo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CPF (Login)</label>
            <input 
              type="text" 
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-bold py-3 rounded-lg transition-colors shadow-md flex justify-center items-center ${
                isLoading 
                ? 'bg-blue-400 cursor-not-allowed text-blue-100' 
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acessando...
                </>
            ) : 'Entrar no Sistema'}
          </button>

          <div className="text-center text-xs text-slate-400 mt-4">
            <p>Em caso de dúvidas, contate o Conselho Central.</p>
          </div>
        </form>
      </div>
    </div>
  );
};
