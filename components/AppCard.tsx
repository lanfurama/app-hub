import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card } from './UI';
import { AppData } from '../types';
import { Edit } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const STAGGER_CLASSES = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6', 'stagger-7', 'stagger-8', 'stagger-9', 'stagger-10', 'stagger-11', 'stagger-12'] as const;

interface AppCardProps {
  app: AppData;
  onView?: (appId: string) => void;
  onEdit?: (appId: string) => void;
  /** Index in grid for stagger animation delay (0-based) */
  index?: number;
}

// Helper to get app icon from app data or fallback logic
const getAppIcon = (app: AppData): string => {
  if (app.icon) return app.icon;
  const slug = app.category === 'DIGITAL_TOOLS' ? 'digital-tools' : app.category === 'OTHER' ? 'other' : (app.category || '');
  if (slug === 'digital-tools') return '🛠️';
  return '💻';
};

// Determine status badge from app data
const getStatusBadge = (app: AppData): { label: string; color: 'green' | 'blue' | 'yellow' } => {
  const status = app.status || 'ACTIVE';
  switch (status) {
    case 'ACTIVE':
      return { label: 'Hoạt động', color: 'green' };
    case 'TRIAL':
      return { label: 'Thử nghiệm', color: 'blue' };
    case 'MAINTENANCE':
      return { label: 'Bảo trì', color: 'yellow' };
    default:
      return { label: 'Hoạt động', color: 'green' };
  }
};

// Get version from app data
const getVersion = (app: AppData): string => {
  return app.version ? `Ver ${app.version}` : 'Ver 1.0.0';
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

export const AppCard: React.FC<AppCardProps> = ({ app, onView, onEdit, index = 0 }) => {
  const { getLabel } = useCategories();
  const status = getStatusBadge(app);
  const version = getVersion(app);
  const icon = getAppIcon(app);
  const categorySlug = app.category === 'DIGITAL_TOOLS' ? 'digital-tools' : app.category === 'OTHER' ? 'other' : (app.category || 'other');
  const categoryLabel = getLabel(categorySlug);
  const staggerClass = STAGGER_CLASSES[index % STAGGER_CLASSES.length];
  
  // Get image URL (prefer imageUrl, fallback to thumbnailUrl)
  const imageUrl = app.imageUrl || app.thumbnailUrl;
  const isRandomImage = imageUrl && imageUrl.includes('picsum.photos');
  const hasValidImage = imageUrl && !isRandomImage;

  return (
    <Card className={`overflow-hidden border border-gray-200 relative group card-stagger card-hover ${staggerClass}`}>
      {/* App Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
        {hasValidImage ? (
          <div className="card-image-zoom w-full h-full">
            <ImageWithFallback
              src={imageUrl}
              alt={app.name}
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <span className="text-4xl">{icon}</span>
                </div>
              }
            />
          </div>
        ) : (
          <div className="card-image-zoom w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
            <span className="text-4xl">{icon}</span>
          </div>
        )}
        </div>
        
        {/* Status Badge - Overlay on image */}
        <div className="absolute top-3 right-3">
          <Badge color={status.color}>{status.label}</Badge>
        </div>

        {/* Edit Button - Overlay on image */}
        {onEdit && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(app.id);
              }}
              className="p-1.5 bg-white/90 hover:bg-white text-gray-600 hover:text-emerald-700 rounded-md transition-colors shadow-sm"
              aria-label="Chỉnh sửa ứng dụng"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* App Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          <Link
            to={`/app/${app.id}`}
            className="hover:text-emerald-700 transition-colors"
            onClick={() => onView?.(app.id)}
          >
            {app.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
          {app.description}
        </p>

        {/* Version & Category */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{version}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
            {categoryLabel}
          </span>
        </div>

        {/* Launch Link */}
        {app.demoUrl ? (
          <a
            href={app.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            Khởi chạy →
          </a>
        ) : (
          <Link
            to={`/app/${app.id}`}
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            onClick={() => onView?.(app.id)}
          >
            Xem chi tiết →
          </Link>
        )}
      </div>
    </Card>
  );
};
