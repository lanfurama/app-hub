import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/icon.jpg"
                alt="Furama Digital Business"
                className="h-8 w-8 object-contain"
              />
              <div className="ml-2 flex flex-col leading-tight">
                <span className="text-base font-semibold text-slate-900">
                  Furama Lab
                </span>
                <span className="text-xs font-medium text-emerald-700">
                  Digital Business Workspace
                </span>
              </div>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-emerald-700 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-emerald-200 hover:text-slate-700'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
