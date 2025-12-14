
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, name, checked, onChange, ...props }) => (
  <label htmlFor={name} className="flex items-center space-x-2 cursor-pointer">
    <input
      id={name}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      {...props}
    />
    <span className="text-sm text-slate-700">{label}</span>
  </label>
);
