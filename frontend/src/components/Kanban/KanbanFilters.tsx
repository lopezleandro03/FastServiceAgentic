import React, { useEffect, useState } from 'react';
import { KanbanFilters as KanbanFiltersType, UserInfo, BusinessInfo } from '../../types/kanban';
import { fetchTechnicians, fetchResponsibles, fetchBusinesses } from '../../services/orderApi';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';

interface KanbanFiltersProps {
  filters: KanbanFiltersType;
  onFiltersChange: (filters: KanbanFiltersType) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const KanbanFilters: React.FC<KanbanFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}) => {
  const [technicians, setTechnicians] = useState<UserInfo[]>([]);
  const [responsibles, setResponsibles] = useState<UserInfo[]>([]);
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Load filter options on mount
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [techData, respData, bizData] = await Promise.all([
          fetchTechnicians(),
          fetchResponsibles(),
          fetchBusinesses(),
        ]);
        setTechnicians(techData);
        setResponsibles(respData);
        setBusinesses(bizData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Boolean(
    filters.technicianId ||
    filters.responsibleId ||
    filters.businessId ||
    filters.fromDate ||
    filters.toDate
  );

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
      {/* Responsable Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Responsable
        </label>
        <select
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
          value={filters.responsibleId || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              responsibleId: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          disabled={isLoadingOptions}
        >
          <option value="">Todos</option>
          {responsibles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tecnico Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Técnico
        </label>
        <select
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
          value={filters.technicianId || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              technicianId: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          disabled={isLoadingOptions}
        >
          <option value="">Todos</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Comercio Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Comercio
        </label>
        <select
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
          value={filters.businessId || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              businessId: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          disabled={isLoadingOptions}
        >
          <option value="">Todos</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desde Date Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Desde
        </label>
        <input
          type="date"
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.fromDate || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              fromDate: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Hasta Date Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Hasta
        </label>
        <input
          type="date"
          className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.toDate || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              toDate: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2 ml-auto">
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
          >
            Borrar Filtros
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="default"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        )}
      </div>
    </div>
  );
};

export default KanbanFilters;
