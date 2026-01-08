import React from 'react';
import { KanbanColumn as KanbanColumnType } from '../../types/kanban';
import { Badge } from '../ui/badge';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onOrderClick?: (orderNumber: number) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onOrderClick }) => {
  return (
    <div className="flex flex-col w-[250px] min-w-[250px] flex-shrink-0 h-full bg-slate-50 rounded-lg border border-slate-200">
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white rounded-t-lg">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
          {column.displayName}
        </h3>
        <Badge variant="secondary" className="ml-2">
          {column.orderCount}
        </Badge>
      </div>

      {/* Orders List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-220px)]">
        {column.orders.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
            Sin órdenes
          </div>
        ) : (
          column.orders.map((order) => (
            <KanbanCard
              key={order.orderNumber}
              order={order}
              onClick={() => onOrderClick?.(order.orderNumber)}
            />
          ))
        )}
      </div>

      {/* Show more indicator if orders are truncated */}
      {column.orderCount > column.orders.length && (
        <div className="px-4 py-2 text-center text-xs text-slate-400 border-t border-slate-200 bg-white rounded-b-lg">
          Mostrando {column.orders.length} de {column.orderCount}
        </div>
      )}
    </div>
  );
};
