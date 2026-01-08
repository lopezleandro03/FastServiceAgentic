import React from 'react';
import { OrderDetails } from '../../types/order';
import StatusBadge from './StatusBadge';

interface OrderDetailsViewProps {
  order: OrderDetails;
}

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order }) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
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
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Orden #{order.orderNumber}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Ingresado: {formatDate(order.repair.entryDate)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Estado</h3>
          <StatusBadge status={order.repair.status} className="text-sm px-3 py-1" />
        </div>

        {/* Customer Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nombre:</span>
              <p className="text-gray-900">{order.customer.fullName}</p>
            </div>
            {order.customer.dni && (
              <div>
                <span className="font-medium text-gray-700">DNI:</span>
                <p className="text-gray-900">{order.customer.dni}</p>
              </div>
            )}
            {order.customer.phone && (
              <div>
                <span className="font-medium text-gray-700">Teléfono:</span>
                <p className="text-gray-900">{order.customer.phone}</p>
              </div>
            )}
            {order.customer.email && (
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{order.customer.email}</p>
              </div>
            )}
            {order.customer.address && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Dirección:</span>
                <p className="text-gray-900">{order.customer.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Dispositivo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Marca:</span>
              <p className="text-gray-900">{order.device.brand}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tipo:</span>
              <p className="text-gray-900">{order.device.deviceType}</p>
            </div>
            {order.device.serialNumber && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Número de Serie:</span>
                <p className="text-gray-900 font-mono">{order.device.serialNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Repair Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Reparación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Fecha Ingreso:</span>
              <p className="text-gray-900">{formatDate(order.repair.entryDate)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha Entrega Est.:</span>
              <p className="text-gray-900">{formatDate(order.repair.estimatedDeliveryDate)}</p>
            </div>
            {order.repair.exitDate && (
              <div>
                <span className="font-medium text-gray-700">Fecha Egreso:</span>
                <p className="text-gray-900">{formatDate(order.repair.exitDate)}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Garantía:</span>
              <p className="text-gray-900">{order.repair.underWarranty ? 'Sí' : 'No'}</p>
            </div>
            {order.repair.estimatedPrice && (
              <div>
                <span className="font-medium text-gray-700">Precio Estimado:</span>
                <p className="text-gray-900 font-semibold">{formatCurrency(order.repair.estimatedPrice)}</p>
              </div>
            )}
            {order.repair.finalPrice && (
              <div>
                <span className="font-medium text-gray-700">Precio Final:</span>
                <p className="text-gray-900 font-semibold text-green-700">{formatCurrency(order.repair.finalPrice)}</p>
              </div>
            )}
            {order.repair.observations && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Observaciones:</span>
                <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded">{order.repair.observations}</p>
              </div>
            )}
          </div>
        </div>

        {/* Technician Information */}
        {order.technician && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Técnico Asignado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nombre:</span>
                <p className="text-gray-900">{order.technician.fullName}</p>
              </div>
              {order.technician.phone && (
                <div>
                  <span className="font-medium text-gray-700">Teléfono:</span>
                  <p className="text-gray-900">{order.technician.phone}</p>
                </div>
              )}
              {order.technician.email && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{order.technician.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Repair Details */}
        {order.details && order.details.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Detalles de Reparación
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.details.map((detail, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{detail.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{detail.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(detail.price)}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">{formatCurrency(detail.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsView;
