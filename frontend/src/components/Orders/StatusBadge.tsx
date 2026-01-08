import React from 'react';
import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const statusLower = status.toLowerCase();
  
  // Completed/Success statuses - use default variant (will be green with custom class)
  if (['reparado', 'para entregar', 'retirado', 'informado'].includes(statusLower)) {
    return 'default';
  }
  
  // In-progress statuses - use secondary variant (will be blue with custom class)
  if (['a reparar', 'esp. repuesto', 'en central', 'rep. domic.', 'presup. en domicilio'].includes(statusLower)) {
    return 'secondary';
  }
  
  // Cancelled/Failed statuses - destructive variant (red)
  if (['rechazado', 'rechazo presup.', 'fallo'].includes(statusLower)) {
    return 'destructive';
  }
  
  // Pending/Assessment/Waiting statuses - outline variant (will have custom colors)
  return 'outline';
};

const getStatusClassName = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  // Completed/Success - green
  if (['reparado', 'para entregar', 'retirado', 'informado'].includes(statusLower)) {
    return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-300';
  }
  
  // In-progress - blue/indigo
  if (['a reparar', 'esp. repuesto'].includes(statusLower)) {
    return 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-300';
  }
  if (['en central', 'rep. domic.', 'presup. en domicilio'].includes(statusLower)) {
    return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-300';
  }
  
  // New/Incoming - blue/gray
  if (['ingresado'].includes(statusLower)) {
    return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300';
  }
  if (['sin determinar'].includes(statusLower)) {
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300';
  }
  
  // Assessment - yellow/purple
  if (['a presupuestar', 'presupuestado'].includes(statusLower)) {
    return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300';
  }
  if (['a visitar', 'visitado'].includes(statusLower)) {
    return 'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300';
  }
  
  // Waiting/On Hold - amber
  if (['espera', 'controlar', 'verificar'].includes(statusLower)) {
    return 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300';
  }
  
  // Re-entry - cyan
  if (['reingresado'].includes(statusLower)) {
    return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100 border-cyan-300';
  }
  
  // Default for unknown statuses
  return 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-300';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusClassName(status)} ${className}`}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
