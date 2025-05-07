import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'paragraph' | 'image' | 'button';
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text',
  lines = 1,
  className = ''
}) => {
  // Generate multiple skeleton lines if needed
  if (type === 'paragraph') {
    return (
      <div className={`animate-pulse space-y-3 ${className}`}>
        {[...Array(lines)].map((_, i) => (
          <div 
            key={i} 
            className={`h-4 bg-gray-200 rounded ${i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }
  
  // Title skeleton
  if (type === 'title') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      </div>
    );
  }
  
  // Button skeleton
  if (type === 'button') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
    );
  }
  
  // Image skeleton
  if (type === 'image') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-48 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  // Default text skeleton
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  );
};

// Content specific skeleton loader that looks like an article
export const ContentSkeletonLoader: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6 w-full">
      {/* Title */}
      <div className="h-9 bg-gray-200 rounded w-3/4 mb-2"></div>
      
      {/* Author/Meta info */}
      <div className="flex space-x-2">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
      
      {/* Content paragraphs with varied widths */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-10/12"></div>
      </div>
      
      {/* Another paragraph block */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-9/12"></div>
      </div>
      
      {/* Quote-like block */}
      <div className="pl-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-11/12"></div>
        <div className="h-4 bg-gray-300 rounded w-10/12"></div>
      </div>
      
      {/* Final paragraphs */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-8/12"></div>
      </div>
    </div>
  );
};