import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OrderSearchCriteria, OrderSummary, OrderStatus, OrderDetails } from '../../types/order';
import { searchOrders, fetchStatuses, fetchOrderDetails } from '../../services/orderApi';
import { OrderList } from './index';
import OrderDetailsView from './OrderDetailsView';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Search, X, Filter, Loader2, ChevronDown, Check } from 'lucide-react';

interface OrderAdvancedSearchProps {
  onOrderClick?: (orderNumber: number) => void;
  onOrderSelected?: (order: OrderDetails | null) => void;
}

const OrderAdvancedSearch: React.FC<OrderAdvancedSearchProps> = ({ onOrderClick, onOrderSelected }) => {
  // Search criteria state
  const [model, setModel] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [customerName, setCustomerName] = useState('');
  const [brand, setBrand] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Results state
  const [results, setResults] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Order details state (for viewing within search)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  
  // Statuses for dropdown
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);

  // Load statuses on mount
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const data = await fetchStatuses();
        setStatuses(data);
      } catch (err) {
        console.error('Error loading statuses:', err);
      } finally {
        setIsLoadingStatuses(false);
      }
    };
    loadStatuses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const criteria: OrderSearchCriteria = {
        model: model.trim() || undefined,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        customerName: customerName.trim() || undefined,
        brand: brand.trim() || undefined,
        orderNumber: orderNumber ? parseInt(orderNumber, 10) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        maxResults: 500,
      };
      
      const data = await searchOrders(criteria);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar órdenes');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [model, selectedStatuses, customerName, brand, orderNumber, fromDate, toDate]);

  const handleOrderClick = async (orderNum: number) => {
    setIsLoadingOrder(true);
    try {
      const order = await fetchOrderDetails(orderNum);
      setSelectedOrder(order);
      // Notify parent for chat action suggestions
      if (onOrderSelected) {
        onOrderSelected(order);
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const handleBackToResults = () => {
    setSelectedOrder(null);
    // Clear chat action suggestions
    if (onOrderSelected) {
      onOrderSelected(null);
    }
  };

  const handleClear = () => {
    setModel('');
    setSelectedStatuses([]);
    setCustomerName('');
    setBrand('');
    setOrderNumber('');
    setFromDate('');
    setToDate('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    setSelectedOrder(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasFilters = model || selectedStatuses.length > 0 || customerName || brand || orderNumber || fromDate || toDate;

  // If viewing order details, show that instead of search
  if (selectedOrder) {
    return (
      <div className="flex flex-col h-full">
        <OrderDetailsView
          order={selectedOrder}
          isLoading={isLoadingOrder}
          onBack={handleBackToResults}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Filters Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Búsqueda Avanzada de Órdenes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Order Number */}
          <div className="space-y-2">
            <Label htmlFor="orderNumber" className="text-sm font-medium text-slate-700">
              Nº Orden
            </Label>
            <Input
              id="orderNumber"
              type="number"
              placeholder="Ej: 12345"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
          
          {/* Model (Modelo) */}
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium text-slate-700">
              Modelo
            </Label>
            <Input
              id="model"
              type="text"
              placeholder="Ej: Galaxy S21, iPhone 13..."
              value={model}
              onChange={(e) => setModel(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
          
          {/* Status (Estado) - Multi-select Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Estado
            </Label>
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className={selectedStatuses.length === 0 ? 'text-muted-foreground' : ''}>
                  {selectedStatuses.length === 0 
                    ? 'Todos los estados' 
                    : selectedStatuses.length === 1 
                      ? selectedStatuses[0]
                      : `${selectedStatuses.length} estados seleccionados`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {statusDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {isLoadingStatuses ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Cargando...</div>
                    ) : (
                      <>
                        {/* Select All / Clear All */}
                        <div className="flex gap-1 p-1 border-b border-input mb-1">
                          <button
                            type="button"
                            onClick={() => setSelectedStatuses(statuses.map(s => s.name))}
                            className="flex-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Seleccionar todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStatuses([])}
                            className="flex-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 rounded"
                          >
                            Limpiar
                          </button>
                        </div>
                        {statuses.map((s) => {
                          const isSelected = selectedStatuses.includes(s.name);
                          return (
                            <button
                              key={s.statusId}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedStatuses(selectedStatuses.filter(st => st !== s.name));
                                } else {
                                  setSelectedStatuses([...selectedStatuses, s.name]);
                                }
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                            >
                              <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-input'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              {s.name}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium text-slate-700">
              Cliente
            </Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Nombre del cliente..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
          
          {/* Brand (Marca) */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium text-slate-700">
              Marca
            </Label>
            <Input
              id="brand"
              type="text"
              placeholder="Ej: Samsung, Apple..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
          
          {/* From Date */}
          <div className="space-y-2">
            <Label htmlFor="fromDate" className="text-sm font-medium text-slate-700">
              Fecha Desde
            </Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* To Date */}
          <div className="space-y-2">
            <Label htmlFor="toDate" className="text-sm font-medium text-slate-700">
              Fecha Hasta
            </Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Buscar
          </Button>
          
          {hasFilters && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </Button>
          )}
          
          {hasSearched && !isLoading && (
            <span className="text-sm text-slate-500 ml-auto">
              {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </span>
          )}
        </div>
      </div>
      
      {/* Results Panel */}
      <div className="flex-1 min-h-0">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Buscar Órdenes</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Utiliza los filtros de arriba para buscar órdenes por modelo, estado, cliente, marca, 
              o rango de fechas. Presiona Enter o haz clic en "Buscar" para comenzar.
            </p>
          </div>
        )}
        
        {hasSearched && results.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Sin Resultados</h3>
            <p className="text-sm text-slate-500 max-w-md">
              No se encontraron órdenes que coincidan con los criterios de búsqueda.
              Intenta con otros filtros.
            </p>
          </div>
        )}
        
        {results.length > 0 && (
          <OrderList
            orders={results}
            onOrderClick={handleOrderClick}
            maxHeight="calc(100vh - 400px)"
          />
        )}
      </div>
    </div>
  );
};

export default OrderAdvancedSearch;
