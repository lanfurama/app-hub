import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/UI';
import { Server, Settings } from 'lucide-react';

export const SystemPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();

  if (pageId === 'server') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Server className="w-8 h-8 text-emerald-700" />
            Trạng thái Server
          </h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi trạng thái và hiệu suất hệ thống</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Database</p>
                <p className="text-2xl font-bold text-emerald-700">Online</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">API Server</p>
                <p className="text-2xl font-bold text-emerald-700">Online</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Phiên bản API</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tổng số ứng dụng</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tổng số feedback</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (pageId === 'settings') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-700" />
            Cài đặt
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý cài đặt hệ thống</p>
        </div>

        <Card className="p-6">
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
    <div className="p-6">
      <Card className="p-6 text-center">
        <p className="text-gray-500">Trang không tồn tại</p>
      </Card>
    </div>
  );
};
