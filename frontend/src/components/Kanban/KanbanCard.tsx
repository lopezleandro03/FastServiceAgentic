import React from 'react';
import { KanbanOrderCard } from '../../types/kanban';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface KanbanCardProps {
  order: KanbanOrderCard;
  onClick?: () => void;
}

// T016: Card component with orderNumber, customerName, deviceSummary
// T017: Technician color badge with deterministic color
// T018: Conditional rendering for warranty, domicile, reentry
// T019: daysSinceNotification display for PRESUPUESTADO/REPARADO
export const KanbanCard: React.FC<KanbanCardProps> = ({ order, onClick }) => {
  const technicianColor = getTechnicianColor(order.technicianId);
  
  return (
    <Card
      className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
        order.isReentry ? 'bg-[#ffbebb] border-red-300' : 'bg-white'
      }`}
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Header Row: Order Number + Indicator Badges */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900 text-sm">
            #{order.orderNumber}
          </span>
          <div className="flex gap-1">
            {/* T018: Warranty indicator - Green shield icon */}
            {order.isWarranty && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0 h-5 bg-green-100 text-green-700 border-green-400 font-semibold"
                title="Garantía"
              >
                <ShieldIcon className="w-3 h-3 mr-0.5" />
                G
              </Badge>
            )}
            {/* T018: Domicile indicator */}
            {order.isDomicile && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0 h-5 bg-blue-50 text-blue-600 border-blue-200"
                title="Domicilio"
              >
                <HomeIcon className="w-3 h-3" />
              </Badge>
            )}
          </div>
        </div>
        
        {/* Customer Name: APELLIDO, NOMBRE format from baseline */}
        <p className="text-sm text-slate-700 truncate font-medium">
          {order.customerName}
        </p>
        
        {/* Device Summary: TYPE-BRAND-MODEL format */}
        <p className="text-xs text-slate-500 truncate">
          {order.deviceSummary}
        </p>
        
        {/* Footer Row: Technician Badge + Days Since Notification */}
        <div className="flex items-center justify-between pt-1">
          {/* T017: Technician color badge */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: technicianColor }}
            />
            <span className="text-xs text-slate-600 truncate">
              {order.technicianName}
            </span>
          </div>
          
          {/* T019: Days since notification - only for PRESUPUESTADO/REPARADO */}
          {order.daysSinceNotification !== null && (
            <Badge 
              variant="secondary" 
              className={`text-xs px-1.5 py-0 h-5 ml-2 flex-shrink-0 ${
                order.daysSinceNotification > 7 
                  ? 'bg-red-100 text-red-700' 
                  : order.daysSinceNotification > 3 
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {order.daysSinceNotification}d
            </Badge>
          )}
        </div>
        
        {/* Responsible - smaller text below technician */}
        {order.responsibleName && order.responsibleName !== order.technicianName && (
          <div className="text-[10px] text-slate-400 truncate">
            Resp: {order.responsibleName}
          </div>
        )}
      </div>
    </Card>
  );
};

// Home icon component
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// Shield icon for warranty
const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08z" clipRule="evenodd" />
  </svg>
);

// T017: Deterministic color palette for technicians
const TECHNICIAN_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

function getTechnicianColor(technicianId: number): string {
  return TECHNICIAN_COLORS[technicianId % TECHNICIAN_COLORS.length];
}

export default KanbanCard;
