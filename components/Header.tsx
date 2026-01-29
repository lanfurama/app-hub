import React, { useState } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 z-30 transition-[left] duration-200">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Mở menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm ứng dụng..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm search-focus-ring"
          />
        </div>
      </div>

      {/* Right Side: Notifications & User */}
      <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Thông báo">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-900 truncate max-w-[100px] md:max-w-none">Admin User</div>
            <div className="text-xs text-gray-500">Digital Business</div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
          </div>
        </div>
      </div>
    </header>
  );
};
