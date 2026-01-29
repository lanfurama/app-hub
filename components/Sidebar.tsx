import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, Circle, Settings, LogOut, Box, Folder, X
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { categories } = useCategories();

  const isActive = (path: string) => currentPath === path;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (open && onClose) onClose();
  }, [currentPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navCategories = [
    { id: 'all', label: 'Tất cả ứng dụng', icon: Grid3x3, path: '/' },
    ...categories.map((cat, i) => ({
      id: cat.slug,
      label: cat.name,
      icon: i === 0 ? Box : Folder,
      path: `/category/${cat.slug}`,
    })),
  ];

  const systemMenu = [
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/system/settings' },
    { id: 'logout', label: 'Đăng xuất', icon: LogOut, path: '/logout' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed left-0 top-0 h-full w-64 max-w-[85vw] bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-200 ease-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center space-x-3 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] flex-1 min-w-0">
          <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold text-gray-900 truncate">Furama Lab</span>
            <span className="text-xs text-emerald-700">Digital Business</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Categories Section */}
        <div className="px-4 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            DANH MỤC
          </h3>
          <nav className="space-y-1">
            {navCategories.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 nav-item-active'
                      : 'text-gray-700 hover:bg-gray-50 hover:pl-4'
                  }`}
                >
                  <span className="relative flex items-center justify-center w-5 h-5">
                    {active ? (
                      <Icon className="w-5 h-5 nav-indicator" />
                    ) : (
                      <Circle className="w-2 h-2 text-gray-400" />
                    )}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Section */}
        <div className="px-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            HỆ THỐNG
          </h3>
          <nav className="space-y-1">
            {systemMenu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 nav-item-active'
                      : 'text-gray-700 hover:bg-gray-50 hover:pl-4'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
    </>
  );
};
