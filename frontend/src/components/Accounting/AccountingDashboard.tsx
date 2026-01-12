import React from 'react';
import { Button } from '../ui/button';
import { RefreshCw, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import { SalesSummaryCards } from './SalesSummaryCards';
import { SalesChart } from './SalesChart';
import { SalesMovementsTable } from './SalesMovementsTable';
import { useAccounting } from '../../hooks/useAccounting';
import { TimeFilterPreset } from '../../types/accounting';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const TIME_PRESETS: { value: TimeFilterPreset; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'year', label: 'Este año' },
];

export const AccountingDashboard: React.FC = () => {
  const {
    summary,
    chartData,
    movements,
    selectedPeriod,
    timePreset,
    selectedYear,
    selectedMonth,
    availableYears,
    isLoading,
    error,
    setSelectedPeriod,
    setTimePreset,
    setSelectedYear,
    setSelectedMonth,
    refreshData,
    goToPage,
  } = useAccounting();

  const getFilterTitle = (): string => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    switch (timePreset) {
      case 'today':
        return 'Movimientos de Hoy';
      case 'week':
        return 'Movimientos de esta Semana';
      case 'month':
        // Show selected month/year or current if viewing current period
        if (selectedYear === currentYear && selectedMonth === currentMonth) {
          return 'Movimientos de este Mes';
        }
        return `Movimientos de ${MONTHS[selectedMonth ?? currentMonth]} ${selectedYear}`;
      case 'year':
        if (selectedYear === currentYear) {
          return 'Movimientos de este Año';
        }
        return `Movimientos de ${selectedYear}`;
      case 'custom':
      default:
        if (selectedMonth !== null) {
          return `Movimientos de ${MONTHS[selectedMonth]} ${selectedYear}`;
        }
        return `Movimientos de ${selectedYear}`;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contabilidad</h1>
            <p className="text-sm text-gray-500">Resumen de ventas y movimientos</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards + Chart section */}
        <div className="space-y-4">
          <SalesSummaryCards
            summary={summary}
            selectedPeriod={selectedPeriod}
            onPeriodSelect={setSelectedPeriod}
            isLoading={isLoading}
          />
          <SalesChart
            chartData={chartData}
            selectedPeriod={selectedPeriod}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            isLoading={isLoading}
          />
        </div>

        {/* Time Filter Controls */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar movimientos:</span>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={timePreset === preset.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePreset(preset.value)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Year selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Año:</span>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Month selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Mes:</span>
              <div className="relative">
                <select
                  value={selectedMonth ?? ''}
                  onChange={(e) => setSelectedMonth(e.target.value === '' ? null : parseInt(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todo el año</option>
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Movements Table - Always visible */}
        <SalesMovementsTable
          movements={movements}
          isLoading={isLoading}
          onPageChange={goToPage}
          title={getFilterTitle()}
        />
      </div>
    </div>
  );
};

export default AccountingDashboard;
