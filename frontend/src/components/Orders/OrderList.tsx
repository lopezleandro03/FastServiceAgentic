import React, { useState, useMemo } from 'react';
import { OrderSummary } from '../../types/order';
import StatusBadge from './StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface OrderListProps {
  orders: OrderSummary[];
  onOrderClick?: (orderNumber: number) => void;
  maxHeight?: string;
}

type SortField = 'orderNumber' | 'customerName' | 'status' | 'entryDate';
type SortDirection = 'asc' | 'desc';

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  onOrderClick,
  maxHeight = '600px'
}) => {
  const [sortField, setSortField] = useState<SortField>('orderNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterText, setFilterText] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply filter
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      filtered = orders.filter(order =>
        order.orderNumber.toString().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.deviceInfo.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    return [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'entryDate') {
        aValue = new Date(a.entryDate).getTime();
        bValue = new Date(b.entryDate).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortDirection, filterText]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number): string => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium">No hay órdenes</h3>
        <p className="mt-1 text-sm text-muted-foreground">Intenta buscar con otros criterios</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/60 bg-white/95 shadow-xl shadow-slate-200/70">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Filtrar por cliente, dispositivo o estado"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold tracking-wide">
            {sortedAndFilteredOrders.length} de {orders.length}
          </span>
          <span className="hidden lg:inline-flex">Ordenados por #{sortField === 'orderNumber' ? 'Número' : 'Campo seleccionado'}</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        <Table>
          <TableHeader className="sticky top-0 bg-white/95 backdrop-blur">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('orderNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span># Orden</span>
                  <SortIcon field="orderNumber" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cliente</span>
                  <SortIcon field="customerName" />
                </div>
              </TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('entryDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <SortIcon field="entryDate" />
                </div>
              </TableHead>
              <TableHead className="text-right">Precio Est.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredOrders.map((order) => (
              <TableRow
                key={order.orderNumber}
                onClick={() => onOrderClick?.(order.orderNumber)}
                className={cn(
                  onOrderClick ? 'cursor-pointer' : '',
                  'transition-all duration-150 hover:-translate-y-[1px] hover:bg-slate-50'
                )}
              >
                <TableCell className="font-medium text-primary">
                  #{order.orderNumber}
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {order.deviceInfo}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.entryDate)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(order.estimatedPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderList;
