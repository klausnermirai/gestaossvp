
import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-blue-800 text-white p-6 rounded-t-2xl flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-800 font-bold text-lg p-1 shadow-md">
        SSVP
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Sociedade de São Vicente de Paulo</h1>
        <p className="text-sm text-blue-200">Cadastro de Famílias Assistidas</p>
      </div>
    </div>
  </header>
);
