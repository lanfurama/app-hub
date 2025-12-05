import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode, color?: 'blue' | 'green' | 'red' | 'gray' | 'yellow' }> = ({ children, color = 'gray' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon: Icon, isLoading, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary: "border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
    outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
    ghost: "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input: React.FC<InputProps> = ({ label, className = '', disabled, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      className={`block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      {...props}
    />
  </div>
);

// --- Textarea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', disabled, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <textarea
      className={`block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      {...props}
    />
  </div>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white overflow-hidden shadow rounded-lg border border-gray-100 ${className}`}>
    {children}
  </div>
);
