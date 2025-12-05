import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-100 shadow overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  </div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-100 p-4">
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-8 w-16" />
  </div>
);

