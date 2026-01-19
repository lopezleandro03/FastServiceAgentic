import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { KanbanBoardData, KanbanFilters as KanbanFiltersType } from '../../types/kanban';
import { fetchKanbanBoard } from '../../services/orderApi';
import { KanbanColumn } from './KanbanColumn';
import { KanbanFilters } from './KanbanFilters';
import { Skeleton } from '../ui/skeleton';

interface KanbanBoardProps {
  onOrderClick?: (orderNumber: number) => void;
  userId?: number;
  isTecnico?: boolean;
  isManager?: boolean;
  isAdmin?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onOrderClick, userId, isTecnico, isManager, isAdmin }) => {
  const [boardData, setBoardData] = useState<KanbanBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // T024: Lift filter state to KanbanBoard
  // Initialize with technicianId filter only for pure tecnicos (not managers/admins)
  const isPureTecnico = isTecnico && !isManager && !isAdmin;
  const initialFilters = useMemo<KanbanFiltersType>(() => {
    if (isPureTecnico && userId) {
      return { technicianId: userId };
    }
    return {};
  }, [isPureTecnico, userId]);
  
  const [filters, setFilters] = useState<KanbanFiltersType>(initialFilters);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  // Initialize filters with technicianId when user is a pure tecnico (only once when permissions load)
  useEffect(() => {
    if (!hasInitializedFilters && isPureTecnico && userId) {
      setFilters({ technicianId: userId });
      setHasInitializedFilters(true);
    }
  }, [isPureTecnico, userId, hasInitializedFilters]);

  const loadBoard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchKanbanBoard(filters);
      setBoardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el tablero');
      console.error('Error loading kanban board:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // T013: Fetch data on mount and when filters change
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  if (isLoading) {
    return <KanbanBoardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadBoard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return null;
  }

  return (
    <div className="h-full flex flex-col gap-4 min-w-0">
      {/* T024: Filter Bar */}
      <KanbanFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={loadBoard}
        isLoading={isLoading}
      />

      {/* Board Header with Total Count */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white rounded-lg flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">
          Seguimiento de Órdenes
        </h2>
        <span className="text-sm text-slate-500">
          Total: {boardData.totalOrders} órdenes
        </span>
      </div>

      {/* Horizontal Scrolling Board */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto p-4 bg-slate-100 rounded-lg">
        <div className="flex gap-4 h-full">
          {boardData.columns.map((column) => (
            <KanbanColumn
              key={column.columnId}
              column={column}
              onOrderClick={onOrderClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// T015: Loading skeleton with 6 columns
const KanbanBoardSkeleton: React.FC = () => {
  const skeletonColumns = Array.from({ length: 6 }, (_, i) => i);
  const skeletonCards = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="h-full flex flex-col">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Columns Skeleton */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full">
          {skeletonColumns.map((i) => (
            <div
              key={i}
              className="flex flex-col min-w-[280px] max-w-[320px] h-full bg-slate-50 rounded-lg border border-slate-200"
            >
              {/* Column Header Skeleton */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white rounded-t-lg">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>

              {/* Cards Skeleton */}
              <div className="flex-1 p-2 space-y-2">
                {skeletonCards.map((j) => (
                  <div key={j} className="p-3 bg-white rounded-lg border border-slate-100">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
