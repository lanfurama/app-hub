import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/UI';
import { Settings } from 'lucide-react';

export const SystemPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();

  if (pageId === 'settings') {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700 flex-shrink-0" />
            Cài đặt
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý cài đặt hệ thống</p>
        </div>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt chung</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên workspace
              </label>
              <input
                type="text"
                defaultValue="Furama Lab"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                rows={3}
                defaultValue="Digital Business Workspace"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="pt-4">
              <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="p-4 sm:p-6 text-center">
        <p className="text-gray-500">Trang không tồn tại</p>
      </Card>
    </div>
  );
};
