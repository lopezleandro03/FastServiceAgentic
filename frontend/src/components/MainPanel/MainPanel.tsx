import React, { useState, useEffect } from 'react';
import { OrderSummary, OrderDetails } from '../../types/order';
import { OrderList, OrderDetailsView } from '../Orders';
import { KanbanBoard } from '../Kanban';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

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

  const isShowingOrderDetails = Boolean(viewingOrderDetails);
  let mainBodyContent: React.ReactNode;

  if (isShowingOrderDetails && viewingOrderDetails) {
    mainBodyContent = (
      <div className="space-y-6">
        <Card className="border border-slate-200 bg-white/90">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Detalle de orden</p>
              <h2 className="text-2xl font-semibold text-slate-900">#{viewingOrderDetails.orderNumber}</h2>
            </div>
            <Button variant="outline" onClick={handleBackToList} className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al listado
            </Button>
          </CardContent>
        </Card>
        <OrderDetailsView order={viewingOrderDetails} />
      </div>
    );
  } else if (isLoadingDetails) {
    mainBodyContent = (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  } else if (orders && orders.length > 0) {
    mainBodyContent = (
      <div className="space-y-4" aria-label="Tabla de órdenes">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Resultados</h2>
            <p className="text-sm text-slate-500">{orders.length} {orders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Datos sincronizados con FastService API
          </div>
        </div>
        <OrderList orders={orders} onOrderClick={handleOrderClick} />
      </div>
    );
  } else {
    // Show Kanban board when no specific orders are searched
    mainBodyContent = (
      <div className="h-full min-w-0 overflow-hidden">
        <KanbanBoard onOrderClick={handleOrderClick} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-w-0">
      <div className="flex-1 min-w-0 overflow-auto">
        {mainBodyContent}
      </div>
    </div>
  );
};

export default MainPanel;
