import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { SalesChartData, ChartPeriod } from '../../types/accounting';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface SalesChartProps {
  chartData: SalesChartData | null;
  selectedPeriod: ChartPeriod;
  selectedYear?: number;
  selectedMonth?: number | null;
  onDataPointClick?: (label: string, index: number) => void;
  isLoading?: boolean;
}

function getChartTitle(period: ChartPeriod, year?: number, month?: number | null): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const y = year ?? currentYear;
  
  switch (period) {
    case 'd':
      return 'Ventas por Hora - Hoy';
    case 'w':
      return 'Ventas por Día - Esta Semana';
    case 'm':
      // For month view, show the selected month or current month
      const m = month !== null && month !== undefined ? month : currentMonth;
      return `Ventas por Día - ${MONTHS[m]} ${y}`;
    case 'y':
      // For year view, always show year only (monthly breakdown)
      return `Ventas por Mes - ${y}`;
    default:
      return 'Ventas';
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const conFactura = payload.find((p: any) => p.dataKey === 'conFactura')?.value || 0;
    const sinFactura = payload.find((p: any) => p.dataKey === 'sinFactura')?.value || 0;
    const total = conFactura + sinFactura;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-purple-600">● Sin Factura:</span>
            <span className="font-medium">{formatCurrency(sinFactura)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-red-500">● Con Factura:</span>
            <span className="font-medium">{formatCurrency(conFactura)}</span>
          </div>
          <div className="border-t pt-1 flex justify-between gap-4">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SalesChart: React.FC<SalesChartProps> = ({
  chartData,
  selectedPeriod,
  selectedYear,
  selectedMonth,
  onDataPointClick,
  isLoading,
}) => {
  const data = useMemo(() => {
    if (!chartData) return [];
    
    return chartData.labels.map((label, index) => ({
      label,
      conFactura: chartData.datasets[0]?.data[index] || 0,
      sinFactura: chartData.datasets[1]?.data[index] || 0,
    }));
  }, [chartData]);

  const chartTitle = useMemo(() => 
    getChartTitle(selectedPeriod, selectedYear, selectedMonth),
    [selectedPeriod, selectedYear, selectedMonth]
  );

  const handleClick = (data: any) => {
    if (onDataPointClick && data?.activeLabel) {
      const index = chartData?.labels.indexOf(data.activeLabel) ?? -1;
      if (index >= 0) {
        onDataPointClick(data.activeLabel, index);
      }
    }
  };

  if (isLoading && !chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LoadingSpinner size="md" message="Cargando gráfico..." fullHeight />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{chartTitle}</span>
          {onDataPointClick && (
            <span className="text-xs font-normal text-gray-500">
              Haz clic en el gráfico para ver detalles
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              onClick={handleClick}
              style={{ cursor: onDataPointClick ? 'pointer' : 'default' }}
            >
              <defs>
                <linearGradient id="colorConFactura" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSinFactura" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sinFactura"
                stackId="1"
                stroke="#a855f7"
                fill="url(#colorSinFactura)"
                name="Sin Factura"
              />
              <Area
                type="monotone"
                dataKey="conFactura"
                stackId="1"
                stroke="#ef4444"
                fill="url(#colorConFactura)"
                name="Con Factura"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Sin Factura</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Con Factura</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
