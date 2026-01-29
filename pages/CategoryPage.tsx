import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { AppCard } from '../components/AppCard';
import { Button, Card } from '../components/UI';
import { NewAppModal } from '../components/NewAppModal';
import { EditAppModal } from '../components/EditAppModal';
import { Plus } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface CategoryPageProps {
  searchQuery?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ searchQuery: externalSearchQuery = '' }) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { apps, isLoaded, error } = useAppStore();
  const { getLabel } = useCategories();
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);

  const slug = (categoryId || '').toLowerCase().trim();

  // Sync external search query
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Filter apps by category slug (API trả về slug: digital-tools, other, ...)
  const filteredApps = useMemo(() => {
    let filtered = apps.filter(app => {
      const appSlug = app.category || 'other';
      const normalizedAppSlug = appSlug === 'DIGITAL_TOOLS' ? 'digital-tools' : appSlug === 'OTHER' ? 'other' : appSlug;
      const matchesCategory = normalizedAppSlug === slug;

      const matchesSearch = searchQuery === '' ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [apps, slug, searchQuery]);

  const handleAppView = useCallback((appId: string) => {
    // Track app view if needed
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6">
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
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-red-800 font-medium">Error loading data</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Page Title */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {getLabel(slug)}
            <span className="ml-2 text-base sm:text-lg font-normal text-gray-500">
              {filteredApps.length}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách ứng dụng thuộc danh mục {getLabel(slug)}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)} className="w-full sm:w-auto flex-shrink-0">
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
          {filteredApps.map((app, index) => (
            <AppCard
              key={app.id}
              app={app}
              index={index}
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
