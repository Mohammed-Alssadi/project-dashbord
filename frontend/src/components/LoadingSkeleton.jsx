import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 w-full p-4 border border-border/60 rounded-xl bg-card">
      <div className="h-6 bg-muted rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  );
}