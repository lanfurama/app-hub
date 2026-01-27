import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, Circle, Server, Settings, LogOut, 
  Briefcase, Megaphone, Users, DollarSign, Code, UserCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const categories = [
    { id: 'all', label: 'Tất cả ứng dụng', icon: Grid3x3, path: '/' },
    { id: 'operations', label: 'Vận hành', icon: Briefcase, path: '/category/operations' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/category/marketing' },
    { id: 'hr', label: 'Nhân sự', icon: Users, path: '/category/hr' },
    { id: 'finance', label: 'Tài chính', icon: DollarSign, path: '/category/finance' },
    { id: 'technical', label: 'Kỹ thuật', icon: Code, path: '/category/technical' },
    { id: 'customer', label: 'Khách hàng', icon: UserCircle, path: '/category/customer' },
  ];

  const systemMenu = [
    { id: 'server', label: 'Trạng thái Server', icon: Server, path: '/system/server' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/system/settings' },
    { id: 'logout', label: 'Đăng xuất', icon: LogOut, path: '/logout' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">Furama Lab</span>
            <span className="text-xs text-emerald-700">Digital Business</span>
          </div>
        </Link>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Categories Section */}
        <div className="px-4 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            DANH MỤC
          </h3>
          <nav className="space-y-1">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {active ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <Circle className="w-2 h-2" />
                  )}
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
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
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
  );
};
