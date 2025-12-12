import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Card, Badge, Button } from '../components/UI';
import { EditAppModal } from '../components/EditAppModal';
import { NewAppModal } from '../components/NewAppModal';
import { CardSkeleton, StatsSkeleton } from '../components/Skeleton';
import { Github, MessageSquare, Bug, Terminal, Edit, Plus, Layers, AlertCircle, Lightbulb, ExternalLink } from 'lucide-react';
import { FeedbackType } from '../types';

export const Dashboard: React.FC = () => {
  const { apps, feedbacks, isLoaded, error, loadingStates } = useAppStore();
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalApps = apps.length;
    const totalBugs = feedbacks.filter(f => f.type === FeedbackType.BUG).length;
    const totalFeatures = feedbacks.filter(f => f.type === FeedbackType.FEATURE).length;
    const totalImprovements = feedbacks.filter(f => f.type === FeedbackType.IMPROVEMENT).length;
    
    return { totalApps, totalBugs, totalFeatures, totalImprovements };
  }, [apps, feedbacks]);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsSkeleton />
          <StatsSkeleton />
          <StatsSkeleton />
          <StatsSkeleton />
        </div>
        
        {/* App Grid Skeleton */}
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
          <p className="text-gray-500 text-xs mt-4">Make sure the dev server is running. API is integrated at http://localhost:3000/api/v1</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6">
        <Card className="group relative overflow-hidden fade-in hover:shadow-md transition-all duration-200" style={{ animationDelay: '0ms' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-full opacity-40"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Total Applications</p>
                  <p className="text-xl font-bold text-gray-900 number-transition">{stats.totalApps}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group relative overflow-hidden fade-in hover:shadow-md transition-all duration-200" style={{ animationDelay: '50ms' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-full opacity-40"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Active Bugs</p>
                  <p className="text-xl font-bold text-gray-900 number-transition">{stats.totalBugs}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group relative overflow-hidden fade-in hover:shadow-md transition-all duration-200" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-bl-full opacity-40"></div>
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Feature Requests</p>
                  <p className="text-xl font-bold text-gray-900 number-transition">{stats.totalFeatures}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* App Grid */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
        <Button variant="primary" icon={Plus} onClick={() => setIsNewAppModalOpen(true)}>
          Create New App
        </Button>
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
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {apps.map((app, index) => (
            <Card 
                key={app.id} 
                className="flex flex-col h-full card-hover fade-in cursor-pointer" 
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                    if (app.demoUrl) {
                        window.open(app.demoUrl, '_blank', 'noopener,noreferrer');
                    }
                }}
            >
                <div className="relative h-40 bg-gray-200 overflow-hidden">
                    {(() => {
                        const imageUrl = app.imageUrl || app.thumbnailUrl;
                        const isRandomImage = imageUrl && imageUrl.includes('picsum.photos');
                        const hasValidImage = imageUrl && !isRandomImage;
                        
                        return hasValidImage ? (
                            <>
                                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                                <img 
                                    src={imageUrl} 
                                    alt={app.name} 
                                    className="w-full h-full object-cover relative image-loading"
                                    onLoad={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.classList.remove('image-loading');
                                        target.classList.add('image-loaded');
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                                        }
                                    }}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                <Terminal className="h-12 w-12 text-gray-400" />
                            </div>
                        );
                    })()}
                    <div className="absolute top-2 right-2 flex space-x-1">
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
                </div>
                <div className="flex-1 p-4 xl:p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-base xl:text-lg font-semibold text-gray-900 truncate flex-1">
                            <Link 
                                to={`/app/${app.id}`} 
                                className="hover:text-indigo-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {app.name}
                            </Link>
                        </h3>
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
                    <div className="mt-auto space-y-2">
                        <div className="flex flex-wrap gap-1">
                            {app.techStack.slice(0, 2).map(tech => (
                                <Badge key={tech} color="gray" className="text-xs">{tech}</Badge>
                            ))}
                            {app.techStack.length > 2 && (
                                <span className="text-xs text-gray-500 self-center">+{app.techStack.length - 2}</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {app.demoUrl && (
                                <Button 
                                    variant="primary" 
                                    className="flex-1 min-w-0 justify-center text-xs py-1.5 px-2 transition-all" 
                                    icon={ExternalLink}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(app.demoUrl, '_blank', 'noopener,noreferrer');
                                    }}
                                >
                                    Demo
                                </Button>
                            )}
                            <Link to={`/app/${app.id}`} className={app.demoUrl ? "flex-1 min-w-0" : "flex-1"}>
                                <Button variant="outline" className="w-full justify-center text-xs py-1.5 px-2 transition-all">
                                    Details
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                className="flex-shrink-0 px-2 py-1.5 transition-all" 
                                icon={Edit}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAppId(app.id);
                                }}
                                disabled={loadingStates[`updateApp-${app.id}`]}
                                title="Edit"
                            >
                                {loadingStates[`updateApp-${app.id}`] ? (
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            ))}
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
        onSuccess={() => {
          // Optionally refresh or show success message
        }}
      />
    </div>
  );
};
