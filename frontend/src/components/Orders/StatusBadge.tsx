import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusStyle = (status: string): string => {
    const statusLower = status.toLowerCase();
    
    // Status color mappings based on repair workflow
    const statusColors: Record<string, string> = {
      // New/Incoming
      'ingresado': 'bg-blue-100 text-blue-800 border-blue-300',
      'sin determinar': 'bg-gray-100 text-gray-800 border-gray-300',
      
      // Assessment
      'a presupuestar': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'presupuestado': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'a visitar': 'bg-purple-100 text-purple-800 border-purple-300',
      'visitado': 'bg-purple-100 text-purple-700 border-purple-300',
      
      // In Progress
      'a reparar': 'bg-orange-100 text-orange-800 border-orange-300',
      'esp. repuesto': 'bg-orange-100 text-orange-700 border-orange-300',
      'en central': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'rep. domic.': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'presup. en domicilio': 'bg-indigo-100 text-indigo-600 border-indigo-300',
      
      // Completed/Success
      'reparado': 'bg-green-100 text-green-800 border-green-300',
      'para entregar': 'bg-green-100 text-green-700 border-green-300',
      'retirado': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'informado': 'bg-teal-100 text-teal-800 border-teal-300',
      
      // Waiting/On Hold
      'espera': 'bg-amber-100 text-amber-800 border-amber-300',
      'controlar': 'bg-amber-100 text-amber-700 border-amber-300',
      'verificar': 'bg-amber-100 text-amber-600 border-amber-300',
      
      // Rejected/Cancelled
      'rechazado': 'bg-red-100 text-red-800 border-red-300',
      'rechazo presup.': 'bg-red-100 text-red-700 border-red-300',
      'fallo': 'bg-red-100 text-red-600 border-red-300',
      
      // Re-entry
      'reingresado': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    };
    
    // Find matching status (case-insensitive)
    for (const [key, value] of Object.entries(statusColors)) {
      if (statusLower.includes(key) || key.includes(statusLower)) {
        return value;
      }
    }
    
    // Default style for unknown statuses
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(
        status
      )} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
