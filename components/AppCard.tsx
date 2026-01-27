import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card } from './UI';
import { AppData } from '../types';
import { Edit } from 'lucide-react';

interface AppCardProps {
  app: AppData;
  onView?: (appId: string) => void;
  onEdit?: (appId: string) => void;
}

// Helper to get app icon from app data or fallback logic
const getAppIcon = (app: AppData): string => {
  // Use icon from database if available
  if (app.icon) return app.icon;
  
  // Fallback: determine icon based on category
  if (app.category === 'OPERATIONS') return '📊';
  if (app.category === 'HR') return '👥';
  if (app.category === 'FINANCE') return '💰';
  if (app.category === 'MARKETING') return '📢';
  if (app.category === 'TECHNICAL') return '📡';
  if (app.category === 'CUSTOMER') return '👤';
  
  // Fallback: determine icon based on name
  const name = app.name.toLowerCase();
  if (name.includes('pms') || name.includes('core')) return '📊';
  if (name.includes('staff') || name.includes('nhân sự')) return '👥';
  if (name.includes('revenue') || name.includes('tài chính')) return '💰';
  if (name.includes('kitchen') || name.includes('nhà bếp')) return '🍽️';
  if (name.includes('marketing')) return '📢';
  if (name.includes('network') || name.includes('mạng')) return '📡';
  
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

// Get human-readable category label
const getCategoryLabel = (app: AppData): string => {
  const category = app.category || 'OTHER';
  switch (category) {
    case 'OPERATIONS':
      return 'Vận hành';
    case 'MARKETING':
      return 'Marketing';
    case 'HR':
      return 'Nhân sự';
    case 'FINANCE':
      return 'Tài chính';
    case 'TECHNICAL':
      return 'Kỹ thuật';
    case 'CUSTOMER':
      return 'Khách hàng';
    default:
      return 'Khác';
  }
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

export const AppCard: React.FC<AppCardProps> = ({ app, onView, onEdit }) => {
  const status = getStatusBadge(app);
  const version = getVersion(app);
  const icon = getAppIcon(app);
  const categoryLabel = getCategoryLabel(app);
  
  // Get image URL (prefer imageUrl, fallback to thumbnailUrl)
  const imageUrl = app.imageUrl || app.thumbnailUrl;
  const isRandomImage = imageUrl && imageUrl.includes('picsum.photos');
  const hasValidImage = imageUrl && !isRandomImage;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 relative group">
      {/* App Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {hasValidImage ? (
          <ImageWithFallback
            src={imageUrl}
            alt={app.name}
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
                <span className="text-4xl">{icon}</span>
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
            <span className="text-4xl">{icon}</span>
          </div>
        )}
        
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
