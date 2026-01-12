import React from 'react';
import { Card, CardContent } from '../ui/card';
import { SalesSummary, ChartPeriod } from '../../types/accounting';

interface SalesSummaryCardsProps {
  summary: SalesSummary | null;
  selectedPeriod: ChartPeriod;
  onPeriodSelect: (period: ChartPeriod) => void;
  isLoading?: boolean;
}

const periodLabels: Record<ChartPeriod, string> = {
  d: 'HOY',
  w: 'SEMANA',
  m: 'MES',
  y: 'AÑO',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({
  summary,
  selectedPeriod,
  onPeriodSelect,
  isLoading,
}) => {
  const periods: { key: ChartPeriod; dataKey: keyof SalesSummary }[] = [
    { key: 'd', dataKey: 'today' },
    { key: 'w', dataKey: 'week' },
    { key: 'm', dataKey: 'month' },
    { key: 'y', dataKey: 'year' },
  ];

  const currentYear = new Date().getFullYear();

  if (isLoading && !summary) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-600">Resumen {currentYear}</span>
          <span className="text-xs text-gray-400">• Click para ver en el gráfico</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {periods.map(({ key }) => (
            <Card key={key} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-600">Resumen {currentYear}</span>
        <span className="text-xs text-gray-400">• Click para ver en el gráfico</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {periods.map(({ key, dataKey }) => {
        const data = summary?.[dataKey];
        const isSelected = selectedPeriod === key;
        
        return (
          <Card
            key={key}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onPeriodSelect(key)}
          >
            <CardContent className="p-4">
              <div className={`text-xs font-semibold mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                {periodLabels[key]}
              </div>
              <div className={`text-2xl font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`} title={data ? formatFullCurrency(data.total) : ''}>
                {data ? formatCurrency(data.total) : '-'}
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sin Factura:</span>
                  <span className="font-medium text-purple-600">
                    {data ? formatCurrency(data.totalWithoutInvoice) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Con Factura:</span>
                  <span className="font-medium text-red-600">
                    {data ? formatCurrency(data.totalWithInvoice) : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
};

export default SalesSummaryCards;
