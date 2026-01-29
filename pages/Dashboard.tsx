import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Card, Badge, Button } from '../components/UI';
import { AppCard } from '../components/AppCard';
import { EditAppModal } from '../components/EditAppModal';
import { NewAppModal } from '../components/NewAppModal';
import { CardSkeleton, StatsSkeleton } from '../components/Skeleton';
import { 
  Github, MessageSquare, Bug, Terminal, Edit, Plus, Layers, AlertCircle, 
  Lightbulb, ExternalLink, Search, Calendar, Clock, Code
} from 'lucide-react';
import { FeedbackType, AppData } from '../types';

// Helper function to format date (relative)
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hôm nay';
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần trước`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng trước`;
  } else {
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

// LocalStorage helpers for favorites and recent apps
const FAVORITES_KEY = 'furama-lab-favorites';
const RECENT_APPS_KEY = 'furama-lab-recent';

const getFavorites = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
};

const getRecentApps = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_APPS_KEY) || '[]');
  } catch {
    return [];
  }
};

const addRecentApp = (appId: string) => {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentApps();
    const filtered = recent.filter(id => id !== appId);
    const updated = [appId, ...filtered].slice(0, 10); // Keep last 10
    localStorage.setItem(RECENT_APPS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent apps', e);
  }
};

interface DashboardProps {
  searchQuery?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ searchQuery: externalSearchQuery = '' }) => {
  const { apps, feedbacks, isLoaded, error, loadingStates, deleteApp } = useAppStore();
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  
  // Sync external search query
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);
  const [selectedTechStack, setSelectedTechStack] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Load favorites and recent on mount
  useEffect(() => {
    setFavorites(getFavorites());
    setRecentApps(getRecentApps());
  }, []);

  // Track app views for recent apps
  const handleAppView = useCallback((appId: string) => {
    addRecentApp(appId);
    setRecentApps(getRecentApps());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with /
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="Tìm kiếm"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // New app with N
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsNewAppModalOpen(true);
      }
      // Clear filters with Escape
      if (e.key === 'Escape' && (searchQuery || selectedTechStack || quickFilter)) {
        setSearchQuery('');
        setSelectedTechStack('');
        setQuickFilter('');
        setSortBy('newest');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, selectedTechStack, quickFilter]);

  const stats = useMemo(() => {
    const totalApps = apps.length;
    const totalBugs = feedbacks.filter(f => f.type === FeedbackType.BUG).length;
    const totalFeatures = feedbacks.filter(f => f.type === FeedbackType.FEATURE).length;
    const totalImprovements = feedbacks.filter(f => f.type === FeedbackType.IMPROVEMENT).length;
    
    return { totalApps, totalBugs, totalFeatures, totalImprovements };
  }, [apps, feedbacks]);

  // Get all unique tech stacks from apps
  const allTechStacks = useMemo(() => {
    const techSet = new Set<string>();
    apps.forEach(app => {
      app.techStack.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [apps]);

  // Get feedback counts for each app
  const getAppFeedbackCounts = useCallback((appId: string) => {
    const appFeedbacks = feedbacks.filter(f => f.appId === appId);
    return {
      total: appFeedbacks.length,
      bugs: appFeedbacks.filter(f => f.type === FeedbackType.BUG).length,
      features: appFeedbacks.filter(f => f.type === FeedbackType.FEATURE).length,
      improvements: appFeedbacks.filter(f => f.type === FeedbackType.IMPROVEMENT).length,
    };
  }, [feedbacks]);

  // Filter and sort apps
  const filteredApps = useMemo(() => {
    let filtered = apps.filter(app => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tech stack filter
      const matchesTechStack = selectedTechStack === '' || 
        app.techStack.includes(selectedTechStack);

      // Quick filters
      let matchesQuickFilter = true;
      if (quickFilter === 'has-demo') {
        matchesQuickFilter = !!app.demoUrl;
      } else if (quickFilter === 'has-github') {
        matchesQuickFilter = !!app.githubUrl;
      } else if (quickFilter === 'has-feedback') {
        matchesQuickFilter = feedbacks.some(f => f.appId === app.id);
      } else if (quickFilter === 'no-feedback') {
        matchesQuickFilter = !feedbacks.some(f => f.appId === app.id);
      } else if (quickFilter === 'favorites') {
        matchesQuickFilter = favorites.includes(app.id);
      }

      return matchesSearch && matchesTechStack && matchesQuickFilter;
    });

    // Sort apps
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'vi');
        case 'tech-count':
          return b.techStack.length - a.techStack.length;
        case 'feedback-count':
          const aCount = getAppFeedbackCounts(a.id).total;
          const bCount = getAppFeedbackCounts(b.id).total;
          return bCount - aCount;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [apps, searchQuery, selectedTechStack, sortBy, quickFilter, feedbacks, favorites, getAppFeedbackCounts]);

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(start, start + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredApps.length]);

  // Recent apps
  const recentAppsData = useMemo(() => {
    return recentApps
      .map(id => apps.find(app => app.id === id))
      .filter((app): app is AppData => app !== undefined)
      .slice(0, 5);
  }, [recentApps, apps]);

  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsSkeleton />
          <StatsSkeleton />
          <StatsSkeleton />
          <StatsSkeleton />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Applications</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CardSkeleton key={i} />
          ))}
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
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tất cả ứng dụng
            <span className="ml-2 text-base sm:text-lg font-normal text-gray-500">
              {filteredApps.length}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan các ứng dụng trong Furama Lab, sắp xếp theo thời gian tạo mới nhất.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)} className="w-full sm:w-auto flex-shrink-0">
          Đăng ký ứng dụng mới
        </Button>
      </div>

      {/* Analytics & recent activity (ẩn để giao diện gọn hơn, có thể bật lại sau) */}
      {false && (
        <>
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
            <Card className="group relative overflow-hidden fade-in hover:shadow-md transition-all duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-full opacity-40"></div>
              <div className="relative p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                    <Layers className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Total Applications</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalApps}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden fade-in hover:shadow-md transition-all duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-full opacity-40"></div>
              <div className="relative p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Active Bugs</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalBugs}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden fade-in hover:shadow-md transition-all duration-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-full opacity-40"></div>
              <div className="relative p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Feature Requests</p>
                    <p className="text-xl font-bold text-gray-900">{stats.totalFeatures}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Apps Section */}
          {recentAppsData.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Xem gần đây
                </h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recentAppsData.map(app => (
                  <Link
                    key={app.id}
                    to={`/app/${app.id}`}
                    onClick={() => handleAppView(app.id)}
                    className="flex-shrink-0"
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Terminal className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{app.name}</p>
                          <p className="text-xs text-gray-500 truncate">{formatDate(app.createdAt)}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {apps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Terminal className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No apps yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new app in your portfolio.</p>
            <div className="mt-6">
                <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)}>
                  Create New App
                </Button>
            </div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy ứng dụng</h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.
            </p>
            <div className="mt-6">
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedTechStack('');
                  setQuickFilter('');
                  setSortBy('newest');
                }}>
                  Xóa bộ lọc
                </Button>
            </div>
        </div>
      ) : (
        <>
          {/* App Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {paginatedApps.map((app, index) => (
              <AppCard
                key={app.id}
                app={app}
                index={index}
                onView={handleAppView}
                onEdit={(appId) => setEditingAppId(appId)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <div className="flex flex-wrap gap-1 justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[2.25rem] px-3 py-2 text-sm border rounded-lg ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit App Modal */}
      {editingAppId && (
        <EditAppModal
          appId={editingAppId}
          isOpen={!!editingAppId}
          onClose={() => setEditingAppId(null)}
        />
      )}

      {/* New App Modal */}
      <NewAppModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Floating Chat Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-emerald-700 text-white rounded-full shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center z-40 floating-btn-pulse"
        aria-label="Chat hỗ trợ"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};
