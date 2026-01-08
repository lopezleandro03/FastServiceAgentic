import React, { useState, useMemo } from 'react';
import { OrderSummary } from '../../types/order';
import StatusBadge from './StatusBadge';

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
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
        <p className="mt-1 text-sm text-gray-500">Intenta buscar con otros criterios</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filter Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar órdenes..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">
            {sortedAndFilteredOrders.length} de {orders.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('orderNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span># Orden</span>
                  <SortIcon field="orderNumber" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cliente</span>
                  <SortIcon field="customerName" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispositivo
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('entryDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <SortIcon field="entryDate" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Est.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredOrders.map((order) => (
              <tr
                key={order.orderNumber}
                onClick={() => onOrderClick?.(order.orderNumber)}
                className={`${
                  onOrderClick ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                  #{order.orderNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {order.customerName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {order.deviceInfo}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {formatDate(order.entryDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                  {formatCurrency(order.estimatedPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
