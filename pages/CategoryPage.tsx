import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { AppCard } from '../components/AppCard';
import { Button, Card } from '../components/UI';
import { NewAppModal } from '../components/NewAppModal';
import { EditAppModal } from '../components/EditAppModal';
import { Plus } from 'lucide-react';
import { AppCategory } from '../types';

// Map category from URL to AppCategory type
const categoryMap: Record<string, AppCategory> = {
  'operations': 'OPERATIONS',
  'marketing': 'MARKETING',
  'hr': 'HR',
  'finance': 'FINANCE',
  'technical': 'TECHNICAL',
  'customer': 'CUSTOMER',
};

const categoryLabels: Record<AppCategory, string> = {
  'OPERATIONS': 'Vận hành',
  'MARKETING': 'Marketing',
  'HR': 'Nhân sự',
  'FINANCE': 'Tài chính',
  'TECHNICAL': 'Kỹ thuật',
  'CUSTOMER': 'Khách hàng',
  'OTHER': 'Khác',
};

interface CategoryPageProps {
  searchQuery?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ searchQuery: externalSearchQuery = '' }) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { apps, isLoaded, error } = useAppStore();
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);

  // Sync external search query
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  const category = categoryId ? categoryMap[categoryId.toLowerCase()] : 'OTHER';

  // Filter apps by category and search
  const filteredApps = useMemo(() => {
    let filtered = apps.filter(app => {
      const appCategory = app.category || 'OTHER';
      const matchesCategory = appCategory === category;
      
      const matchesSearch = searchQuery === '' || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

    // Sort by created_at DESC
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [apps, category, searchQuery]);

  const handleAppView = useCallback((appId: string) => {
    // Track app view if needed
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-5">
                <div className="h-32 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error loading data</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {categoryLabels[category]}
            <span className="ml-2 text-lg font-normal text-gray-500">
              {filteredApps.length}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách ứng dụng thuộc danh mục {categoryLabels[category]}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)}>
          Đăng ký ứng dụng mới
        </Button>
      </div>

      {/* Apps Grid */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-2">
            Chưa có ứng dụng nào trong danh mục này
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy đăng ký ứng dụng đầu tiên'}
          </p>
          <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)}>
            Đăng ký ứng dụng mới
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onView={handleAppView}
              onEdit={(appId) => setEditingAppId(appId)}
            />
          ))}
        </div>
      )}

      {/* New App Modal */}
      <NewAppModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Edit App Modal */}
      {editingAppId && (
        <EditAppModal
          appId={editingAppId}
          isOpen={!!editingAppId}
          onClose={() => setEditingAppId(null)}
          onSuccess={() => setEditingAppId(null)}
        />
      )}
    </div>
  );
};
