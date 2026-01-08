import React, { useState, useEffect } from 'react';
import { OrderSummary, OrderDetails } from '../../types/order';
import { OrderList, OrderDetailsView } from '../Orders';
import { Button } from '../ui/button';

interface MainPanelProps {
  orders?: OrderSummary[];
  selectedOrderDetails?: OrderDetails | null;
}

const MainPanel: React.FC<MainPanelProps> = ({ orders, selectedOrderDetails }) => {
  const [viewingOrderDetails, setViewingOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // When selectedOrderDetails changes from chat, update the view
  useEffect(() => {
    if (selectedOrderDetails) {
      setViewingOrderDetails(selectedOrderDetails);
    }
  }, [selectedOrderDetails]);

  const handleOrderClick = async (orderNumber: number) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:5207/api/orders/${orderNumber}`);
      if (response.ok) {
        const orderDetails = await response.json();
        setViewingOrderDetails(orderDetails);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setViewingOrderDetails(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-6 border-b bg-white">
        <h1 className="text-3xl font-bold text-gray-800">
          FastService - Order Management
        </h1>
        <p className="text-gray-600 mt-2">
          Use the chat to search orders, or click on results to view details.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {viewingOrderDetails ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {orders && orders.length > 0 ? 'Resultados de Búsqueda' : 'Inicio'}
              </Button>
            </div>
            <OrderDetailsView order={viewingOrderDetails} />
          </div>
        ) : isLoadingDetails ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Resultados de Búsqueda
              </h2>
              <span className="text-sm text-gray-600">
                {orders.length} {orders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}
              </span>
            </div>
            <OrderList orders={orders} onOrderClick={handleOrderClick} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Bienvenido a FastService
              </h2>
              <p className="text-gray-600 mb-4">
                Podés interactuar con el asistente en el panel de chat para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Buscar órdenes de reparación por número, nombre de cliente o DNI</li>
                <li>Ver información detallada de las órdenes</li>
                <li>Consultar el estado y técnico asignado</li>
                <li>Obtener información sobre tipos de dispositivos y marcas</li>
              </ul>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Ejemplos de Consultas
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li>• "Buscá la orden 12345"</li>
                <li>• "Mostrame órdenes de Juan Pérez"</li>
                <li>• "¿Qué órdenes están pendientes?"</li>
                <li>• "Buscá órdenes de Samsung TV que estén rechazadas"</li>
                <li>• "¿Cuáles son los estados disponibles?"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPanel;
