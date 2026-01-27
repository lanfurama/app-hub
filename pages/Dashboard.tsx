import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Card, Badge, Button } from '../components/UI';
import { EditAppModal } from '../components/EditAppModal';
import { NewAppModal } from '../components/NewAppModal';
import { CardSkeleton, StatsSkeleton } from '../components/Skeleton';
import { 
  Github, MessageSquare, Bug, Terminal, Edit, Plus, Layers, AlertCircle, 
  Lightbulb, ExternalLink, Search, Filter, X, ArrowUpDown, Calendar, 
  Grid3x3, List, Star, Download, Upload, Trash2, CheckSquare, Square,
  Clock, Code
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

// Helper function to format full date
const formatFullDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Image component with fallback
const ImageWithFallback: React.FC<{
  src: string;
  alt: string;
  fallback: React.ReactNode;
}> = ({ src, alt, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover relative ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
};

// LocalStorage helpers for favorites and recent apps
const FAVORITES_KEY = 'app-hub-favorites';
const RECENT_APPS_KEY = 'app-hub-recent';

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

export const Dashboard: React.FC = () => {
  const { apps, feedbacks, isLoaded, error, loadingStates, deleteApp } = useAppStore();
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

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

  // Toggle favorite
  const toggleFavorite = useCallback((appId: string) => {
    const newFavorites = favorites.includes(appId)
      ? favorites.filter(id => id !== appId)
      : [...favorites, appId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  }, [favorites]);

  // Toggle app selection
  const toggleAppSelection = useCallback((appId: string) => {
    setSelectedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  }, []);

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

  // Select all apps
  const selectAllApps = useCallback(() => {
    if (selectedApps.size === filteredApps.length) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(filteredApps.map(app => app.id)));
    }
  }, [filteredApps, selectedApps.size]);

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(start, start + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredApps.length]);

  // Export apps
  const handleExport = useCallback(() => {
    const appsToExport = selectedApps.size > 0
      ? apps.filter(app => selectedApps.has(app.id))
      : filteredApps;

    const dataStr = JSON.stringify(appsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apps-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [selectedApps, apps, filteredApps]);

  // Import apps
  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedApps = JSON.parse(text);
      if (Array.isArray(importedApps)) {
        // You would need to add import functionality to useAppStore
        alert(`Đã import ${importedApps.length} apps. Tính năng này cần tích hợp với API.`);
        setShowImportModal(false);
        setImportFile(null);
      }
    } catch (error) {
      alert('Lỗi khi import file. Vui lòng kiểm tra định dạng JSON.');
    }
  }, []);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedApps.size === 0) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedApps.size} ứng dụng?`)) return;

    try {
      for (const appId of selectedApps) {
        await deleteApp(appId);
      }
      setSelectedApps(new Set());
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa ứng dụng');
    }
  }, [selectedApps, deleteApp]);

  // Recent apps
  const recentAppsData = useMemo(() => {
    return recentApps
      .map(id => apps.find(app => app.id === id))
      .filter((app): app is AppData => app !== undefined)
      .slice(0, 5);
  }, [recentApps, apps]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error loading data</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
          <div className="flex gap-2 flex-wrap">
            {selectedApps.size > 0 && (
              <>
                <Button variant="outline" icon={Trash2} onClick={handleBulkDelete}>
                  Xóa ({selectedApps.size})
                </Button>
                <Button variant="outline" icon={Download} onClick={handleExport}>
                  Export
                </Button>
              </>
            )}
            <Button variant="outline" icon={Upload} onClick={() => setShowImportModal(true)}>
              Import
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)}>
              Create New App
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQuickFilter(quickFilter === 'has-demo' ? '' : 'has-demo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              quickFilter === 'has-demo'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ExternalLink className="w-3 h-3 inline mr-1" />
            Có Demo
          </button>
          <button
            onClick={() => setQuickFilter(quickFilter === 'has-github' ? '' : 'has-github')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              quickFilter === 'has-github'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Github className="w-3 h-3 inline mr-1" />
            Có GitHub
          </button>
          <button
            onClick={() => setQuickFilter(quickFilter === 'has-feedback' ? '' : 'has-feedback')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              quickFilter === 'has-feedback'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-3 h-3 inline mr-1" />
            Có Feedback
          </button>
          <button
            onClick={() => setQuickFilter(quickFilter === 'no-feedback' ? '' : 'no-feedback')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              quickFilter === 'no-feedback'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-3 h-3 inline mr-1" />
            Chưa có Feedback
          </button>
          <button
            onClick={() => setQuickFilter(quickFilter === 'favorites' ? '' : 'favorites')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              quickFilter === 'favorites'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="w-3 h-3 inline mr-1" />
            Yêu thích
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả hoặc công nghệ... (Nhấn / để focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Tech Stack Filter */}
          <div className="relative sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedTechStack}
              onChange={(e) => setSelectedTechStack(e.target.value)}
              className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
            >
              <option value="">Tất cả công nghệ</option>
              {allTechStacks.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {selectedTechStack && (
              <button
                onClick={() => setSelectedTechStack('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Xóa bộ lọc"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowUpDown className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="tech-count">Nhiều công nghệ nhất</option>
              <option value="feedback-count">Nhiều feedback nhất</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              title="Grid view"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results count and bulk select */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Tìm thấy <strong>{filteredApps.length}</strong> ứng dụng
              {searchQuery && ` với từ khóa "${searchQuery}"`}
              {selectedTechStack && ` sử dụng "${selectedTechStack}"`}
            </span>
            {(searchQuery || selectedTechStack || quickFilter || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTechStack('');
                  setQuickFilter('');
                  setSortBy('newest');
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </button>
            )}
          </div>
          {filteredApps.length > 0 && (
            <button
              onClick={selectAllApps}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              {selectedApps.size === filteredApps.length ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Bỏ chọn tất cả
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  Chọn tất cả
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
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
          {/* App Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {paginatedApps.map((app, index) => {
                const feedbackCounts = getAppFeedbackCounts(app.id);
                return (
                  <Card 
                    key={app.id} 
                    className={`flex flex-col h-full card-hover fade-in ${selectedApps.has(app.id) ? 'ring-2 ring-indigo-500' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, a')) return;
                      toggleAppSelection(app.id);
                    }}
                  >
                    <div className="relative h-40 bg-gray-200 overflow-hidden">
                      {(() => {
                        const imageUrl = app.imageUrl || app.thumbnailUrl;
                        const isRandomImage = imageUrl && imageUrl.includes('picsum.photos');
                        const hasValidImage = imageUrl && !isRandomImage;
                        
                        if (!hasValidImage) {
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                              <Terminal className="h-12 w-12 text-gray-400" />
                            </div>
                          );
                        }

                        return (
                          <ImageWithFallback 
                            src={imageUrl} 
                            alt={app.name}
                            fallback={
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                <Terminal className="h-12 w-12 text-gray-400" />
                              </div>
                            }
                          />
                        );
                      })()}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(app.id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            favorites.includes(app.id)
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'bg-white/90 hover:bg-white text-gray-800'
                          }`}
                          title={favorites.includes(app.id) ? 'Bỏ yêu thích' : 'Yêu thích'}
                        >
                          <Star className={`w-4 h-4 ${favorites.includes(app.id) ? 'fill-current' : ''}`} />
                        </button>
                        {app.githubUrl && (
                          <a 
                            href={app.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Github size={16} />
                          </a>
                        )}
                      </div>
                      {selectedApps.has(app.id) && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-indigo-500 text-white rounded-full p-1">
                            <CheckSquare className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 xl:p-5 flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base xl:text-lg font-semibold text-gray-900 truncate">
                            <Link 
                              to={`/app/${app.id}`} 
                              className="hover:text-indigo-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAppView(app.id);
                              }}
                            >
                              {app.name}
                            </Link>
                          </h3>
                          <div 
                            className="flex items-center gap-1.5 mt-1 text-xs text-gray-500"
                            title={`Thêm vào: ${formatFullDate(app.createdAt)}`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(app.createdAt)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAppId(app.id);
                          }}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          aria-label="Edit application"
                          disabled={loadingStates[`updateApp-${app.id}`]}
                        >
                          {loadingStates[`updateApp-${app.id}`] ? (
                            <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <Edit size={14} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs xl:text-sm text-gray-600 line-clamp-2 xl:line-clamp-3 flex-1 mb-2">{app.description}</p>
                      
                      {/* Statistics */}
                      <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Code className="w-3.5 h-3.5" />
                          <span>{app.techStack.length} tech</span>
                        </div>
                        {feedbackCounts.total > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{feedbackCounts.total} feedback</span>
                          </div>
                        )}
                        {feedbackCounts.bugs > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Bug className="w-3.5 h-3.5" />
                            <span>{feedbackCounts.bugs}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {app.techStack.slice(0, 2).map(tech => (
                            <Badge key={tech} color="gray" className="text-xs">{tech}</Badge>
                          ))}
                          {app.techStack.length > 2 && (
                            <span className="text-xs text-gray-500 self-center">+{app.techStack.length - 2}</span>
                          )}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {app.demoUrl && (
                            <Button 
                              variant="primary" 
                              className="flex-1 basis-0 justify-center text-xs py-2 px-2 transition-all min-w-0" 
                              icon={ExternalLink}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(app.demoUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              <span className="truncate">Demo</span>
                            </Button>
                          )}
                          <Link to={`/app/${app.id}`} className="flex-1 basis-0 min-w-0" onClick={(e) => {
                            e.stopPropagation();
                            handleAppView(app.id);
                          }}>
                            <Button variant="outline" className="w-full justify-center text-xs py-2 px-2 transition-all">
                              <span className="truncate">Details</span>
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="flex-1 basis-0 justify-center text-xs py-2 px-2 transition-all min-w-0" 
                            icon={Edit}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAppId(app.id);
                            }}
                            disabled={loadingStates[`updateApp-${app.id}`]}
                            title="Chỉnh sửa"
                          >
                            {loadingStates[`updateApp-${app.id}`] ? (
                              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <span className="truncate hidden xs:inline">Edit</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedApps.map((app) => {
                const feedbackCounts = getAppFeedbackCounts(app.id);
                return (
                  <Card 
                    key={app.id}
                    className={`p-4 hover:shadow-md transition-shadow ${selectedApps.has(app.id) ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, a')) return;
                      toggleAppSelection(app.id);
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedApps.has(app.id)}
                          onChange={() => toggleAppSelection(app.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                to={`/app/${app.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAppView(app.id);
                                }}
                                className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                              >
                                {app.name}
                              </Link>
                              {favorites.includes(app.id) && (
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{app.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(app.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Code className="w-3.5 h-3.5" />
                                <span>{app.techStack.length} công nghệ</span>
                              </div>
                              {feedbackCounts.total > 0 && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{feedbackCounts.total} feedback</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {app.techStack.slice(0, 5).map(tech => (
                                <Badge key={tech} color="gray" className="text-xs">{tech}</Badge>
                              ))}
                              {app.techStack.length > 5 && (
                                <span className="text-xs text-gray-500 self-center">+{app.techStack.length - 5}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {app.demoUrl && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={ExternalLink}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(app.demoUrl, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                Demo
                              </Button>
                            )}
                            <Link to={`/app/${app.id}`} onClick={(e) => {
                              e.stopPropagation();
                              handleAppView(app.id);
                            }}>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAppId(app.id);
                              }}
                            >
                              Edit
                            </Button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(app.id);
                              }}
                              className={`p-2 rounded-md transition-colors ${
                                favorites.includes(app.id)
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${favorites.includes(app.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-lg ${
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Apps</h3>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImportFile(file);
              }}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
              }}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (importFile) handleImport(importFile);
                }}
                disabled={!importFile}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
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
    </div>
  );
};
