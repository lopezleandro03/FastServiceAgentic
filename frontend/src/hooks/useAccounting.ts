import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SalesSummary,
  SalesChartData,
  SalesMovementsResponse,
  SalesMovementFilter,
  ChartPeriod,
  PaymentMethod,
  TimeFilterPreset,
} from '../types/accounting';
import {
  fetchSalesSummary,
  fetchSalesChart,
  fetchSalesMovements,
  fetchPaymentMethods,
} from '../services/accountingService';

export interface UseAccountingReturn {
  // Data
  summary: SalesSummary | null;
  chartData: SalesChartData | null;
  movements: SalesMovementsResponse | null;
  paymentMethods: PaymentMethod[];
  
  // State
  selectedPeriod: ChartPeriod;
  filter: SalesMovementFilter;
  timePreset: TimeFilterPreset;
  selectedYear: number;
  selectedMonth: number | null;
  availableYears: number[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedPeriod: (period: ChartPeriod) => void;
  setFilter: (filter: SalesMovementFilter) => void;
  setTimePreset: (preset: TimeFilterPreset) => void;
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number | null) => void;
  refreshData: () => void;
  goToPage: (page: number) => void;
}

// Generate available years (current year and 5 years back)
function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = 0; i <= 5; i++) {
    years.push(currentYear - i);
  }
  return years;
}

// Calculate date range based on preset, year, and month
function calculateDateRange(
  preset: TimeFilterPreset,
  year: number,
  month: number | null
): { startDate: string; endDate: string } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (preset) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
    default:
      if (month !== null) {
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      }
      break;
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function useAccounting(): UseAccountingReturn {
  const currentYear = new Date().getFullYear();
  
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [chartData, setChartData] = useState<SalesChartData | null>(null);
  const [movements, setMovements] = useState<SalesMovementsResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('m');
  const [timePreset, setTimePreset] = useState<TimeFilterPreset>('month');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [filter, setFilter] = useState<SalesMovementFilter>({ page: 1, pageSize: 15, sortDesc: true });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageChanged, setPageChanged] = useState(false);

  const availableYears = useMemo(() => getAvailableYears(), []);

  // Load summary data
  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchSalesSummary();
      setSummary(data);
    } catch (err) {
      setError('Error al cargar el resumen de ventas');
      console.error(err);
    }
  }, []);

  // Load chart data with year and month
  const loadChart = useCallback(async (period: ChartPeriod, year?: number, month?: number | null) => {
    try {
      const data = await fetchSalesChart(period, year, month ?? undefined);
      setChartData(data);
    } catch (err) {
      setError('Error al cargar los datos del gráfico');
      console.error(err);
    }
  }, []);

  // Load movements with current filter
  const loadMovements = useCallback(async (currentFilter: SalesMovementFilter) => {
    try {
      const data = await fetchSalesMovements(currentFilter);
      setMovements(data);
    } catch (err) {
      setError('Error al cargar los movimientos');
      console.error(err);
    }
  }, []);

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    try {
      const data = await fetchPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  }, []);

  // Initial load of summary, chart, and payment methods
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        loadSummary(),
        loadChart(selectedPeriod, selectedYear, selectedMonth),
        loadPaymentMethods(),
      ]);
      setIsLoading(false);
    };
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load chart when period, year, or month changes
  useEffect(() => {
    setIsLoading(true);
    loadChart(selectedPeriod, selectedYear, selectedMonth).finally(() => setIsLoading(false));
  }, [selectedPeriod, selectedYear, selectedMonth, loadChart]);

  // Load movements when filter parameters change (excluding page-only changes)
  useEffect(() => {
    const { startDate, endDate } = calculateDateRange(timePreset, selectedYear, selectedMonth);
    const updatedFilter: SalesMovementFilter = {
      ...filter,
      startDate,
      endDate,
      page: pageChanged ? filter.page : 1,
    };
    
    if (!pageChanged) {
      setFilter(prev => ({ ...prev, page: 1 }));
    }
    setPageChanged(false);
    
    setIsLoading(true);
    loadMovements(updatedFilter).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePreset, selectedYear, selectedMonth]);

  // Handle period change - sync time filters with chart period
  const handlePeriodChange = useCallback((period: ChartPeriod) => {
    setSelectedPeriod(period);
    
    // Sync time filters based on selected period
    switch (period) {
      case 'd':
        setTimePreset('today');
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(new Date().getMonth());
        break;
      case 'w':
        setTimePreset('week');
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(new Date().getMonth());
        break;
      case 'm':
        setTimePreset('month');
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(new Date().getMonth());
        break;
      case 'y':
        setTimePreset('year');
        setSelectedMonth(null); // Clear month for yearly view
        break;
    }
  }, []);

  // Handle time preset change - also sync chart period
  const handleTimePresetChange = useCallback((preset: TimeFilterPreset) => {
    setTimePreset(preset);
    
    // Sync chart period based on time preset
    switch (preset) {
      case 'today':
        setSelectedPeriod('d');
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(new Date().getMonth());
        break;
      case 'week':
        setSelectedPeriod('w');
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(new Date().getMonth());
        break;
      case 'month':
        setSelectedPeriod('m');
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth(new Date().getMonth());
        break;
      case 'year':
        setSelectedPeriod('y');
        setSelectedMonth(null);
        break;
      case 'custom':
        // Keep current period for custom selection
        break;
    }
  }, []);

  // Handle year change
  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    setTimePreset('custom');
    // If no month selected, show yearly view; otherwise keep monthly view
    if (selectedMonth === null) {
      setSelectedPeriod('y');
    }
  }, [selectedMonth]);

  // Handle month change
  const handleMonthChange = useCallback((month: number | null) => {
    setSelectedMonth(month);
    setTimePreset('custom');
    // When selecting a specific month, switch to monthly chart view
    // When selecting "Todo el año", switch to yearly chart view
    if (month !== null) {
      setSelectedPeriod('m');
    } else {
      setSelectedPeriod('y');
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const { startDate, endDate } = calculateDateRange(timePreset, selectedYear, selectedMonth);
    const updatedFilter: SalesMovementFilter = {
      ...filter,
      startDate,
      endDate,
    };
    
    await Promise.all([
      loadSummary(),
      loadChart(selectedPeriod, selectedYear, selectedMonth),
      loadMovements(updatedFilter),
    ]);
    setIsLoading(false);
  }, [loadSummary, loadChart, loadMovements, selectedPeriod, filter, timePreset, selectedYear, selectedMonth]);

  // Go to page
  const goToPage = useCallback((page: number) => {
    setPageChanged(true);
    setFilter(prev => ({ ...prev, page }));
    
    const { startDate, endDate } = calculateDateRange(timePreset, selectedYear, selectedMonth);
    const updatedFilter: SalesMovementFilter = {
      ...filter,
      startDate,
      endDate,
      page,
    };
    
    setIsLoading(true);
    loadMovements(updatedFilter).finally(() => setIsLoading(false));
  }, [filter, timePreset, selectedYear, selectedMonth, loadMovements]);

  return {
    summary,
    chartData,
    movements,
    paymentMethods,
    selectedPeriod,
    filter,
    timePreset,
    selectedYear,
    selectedMonth,
    availableYears,
    isLoading,
    error,
    setSelectedPeriod: handlePeriodChange,
    setFilter,
    setTimePreset: handleTimePresetChange,
    setSelectedYear: handleYearChange,
    setSelectedMonth: handleMonthChange,
    refreshData,
    goToPage,
  };
}
