import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const OrderListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderListSkeleton;
