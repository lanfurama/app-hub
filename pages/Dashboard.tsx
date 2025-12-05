import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Card, Badge, Button } from '../components/UI';
import { EditAppModal } from '../components/EditAppModal';
import { NewAppModal } from '../components/NewAppModal';
import { CardSkeleton, StatsSkeleton } from '../components/Skeleton';
import { Github, ExternalLink, MessageSquare, Bug, Terminal, Edit, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FeedbackType } from '../types';

export const Dashboard: React.FC = () => {
  const { apps, feedbacks, isLoaded, error } = useAppStore();
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalApps = apps.length;
    const totalBugs = feedbacks.filter(f => f.type === FeedbackType.BUG).length;
    const totalFeatures = feedbacks.filter(f => f.type === FeedbackType.FEATURE).length;
    const totalImprovements = feedbacks.filter(f => f.type === FeedbackType.IMPROVEMENT).length;
    
    return { totalApps, totalBugs, totalFeatures, totalImprovements };
  }, [apps, feedbacks]);

  const chartData = [
    { name: 'Bugs', value: stats.totalBugs, color: '#EF4444' },
    { name: 'Features', value: stats.totalFeatures, color: '#3B82F6' },
    { name: 'Improvements', value: stats.totalImprovements, color: '#10B981' },
  ].filter(d => d.value > 0);

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <p className="text-gray-500 text-xs mt-4">Make sure the API server is running at http://localhost:3001</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-500">Total Applications</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalApps}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-500">Active Bugs Reported</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalBugs}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Feature Requests</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalFeatures}</p>
        </Card>
        
        {/* Simple Chart */}
        <Card className="p-2 md:row-span-2 md:col-start-4 flex items-center justify-center min-h-[150px]">
            {chartData.length > 0 ? (
                <div className="w-full h-32">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                     </ResponsiveContainer>
                     <p className="text-center text-xs text-gray-400">Feedback Distribution</p>
                </div>
            ) : (
                <p className="text-xs text-gray-400">No feedback data yet</p>
            )}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
            <Card key={app.id} className="flex flex-col h-full hover:shadow-lg">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {(app.imageUrl || app.thumbnailUrl) ? (
                        <>
                            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                            <img 
                                src={app.imageUrl || app.thumbnailUrl} 
                                alt={app.name} 
                                className="w-full h-full object-cover relative"
                                onLoad={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.opacity = '1';
                                }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://picsum.photos/400/200?random=${app.id}`;
                                }}
                                style={{ opacity: 0 }}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                            <Terminal className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                        {app.githubUrl && (
                            <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800">
                                <Github size={16} />
                            </a>
                        )}
                        {app.demoUrl && (
                            <a href={app.demoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/90 rounded-full hover:bg-white text-indigo-600">
                                <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                            <Link to={`/app/${app.id}`} className="hover:text-indigo-600">
                                {app.name}
                            </Link>
                        </h3>
                        <button 
                            onClick={() => setEditingAppId(app.id)}
                            className="ml-2 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                            aria-label="Edit application"
                        >
                            <Edit size={16} />
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">{app.description}</p>
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {app.techStack.slice(0, 3).map(tech => (
                                <Badge key={tech} color="gray">{tech}</Badge>
                            ))}
                            {app.techStack.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">+{app.techStack.length - 3}</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                className="flex-1 justify-center" 
                                icon={Edit}
                                onClick={() => setEditingAppId(app.id)}
                            >
                                Edit
                            </Button>
                            <Link to={`/app/${app.id}`} className="flex-1">
                                <Button variant="outline" className="w-full justify-center">
                                    View Details
                                </Button>
                            </Link>
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
