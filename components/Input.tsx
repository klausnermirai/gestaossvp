
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const baseInputClasses = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

export const Input: React.FC<InputProps> = ({ label, name, ...props }) => (
  <div>
    {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input id={name} name={name} type="text" className={baseInputClasses} {...props} />
  </div>
);

export const DateInput: React.FC<InputProps> = ({ label, name, ...props }) => (
  <div>
    {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input id={name} name={name} type="date" className={baseInputClasses} {...props} />
  </div>
);

interface NumberInputProps extends InputProps {
    isCurrency?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, name, isCurrency, ...props }) => (
    <div>
        {label && <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
            {isCurrency && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">R$</span>}
            <input 
                id={name} 
                name={name} 
                type="number" 
                step="0.01"
                className={`${baseInputClasses} ${isCurrency ? 'pl-9' : ''}`}
                {...props} 
            />
        </div>
    </div>
);
