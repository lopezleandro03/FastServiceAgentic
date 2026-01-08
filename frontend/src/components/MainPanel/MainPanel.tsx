import React, { useState, useEffect, useMemo } from 'react';
import { OrderSummary, OrderDetails } from '../../types/order';
import { OrderList, OrderDetailsView } from '../Orders';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MainPanelProps {
  orders?: OrderSummary[];
  selectedOrderDetails?: OrderDetails | null;
}

const MainPanel: React.FC<MainPanelProps> = ({ orders, selectedOrderDetails }) => {
  const [viewingOrderDetails, setViewingOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const statusSnapshot = useMemo(() => {
    if (!orders?.length) {
      return { total: 0, active: 0, awaiting: 0, completed: 0, escalated: 0 };
    }

    const completedStatuses = ['reparado', 'para entregar', 'retirado', 'informado', 'finalizado', 'entregado'];
    const awaitingStatuses = ['esp. repuesto', 'presupuestado', 'a reparar'];
    const escalatedStatuses = ['rechazado', 'rechazo presup.', 'fallo'];

    return orders.reduce(
      (acc, order) => {
        const status = order.status?.toLowerCase() ?? '';
        if (completedStatuses.includes(status)) acc.completed += 1;
        else acc.active += 1;

        if (awaitingStatuses.includes(status)) acc.awaiting += 1;
        if (escalatedStatuses.includes(status)) acc.escalated += 1;
        return acc;
      },
      { total: orders.length, active: 0, awaiting: 0, completed: 0, escalated: 0 }
    );
  }, [orders]);

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
    mainBodyContent = (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Bienvenido a FastService</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-600">
            <p>Utilizá el chat para acelerar tus búsquedas y mantener una vista consolidada de tus órdenes.</p>
            <ul className="space-y-2 text-sm">
              <li>• Buscar por número, cliente o DNI</li>
              <li>• Ver estados y técnicos asignados</li>
              <li>• Consultar dispositivos y fechas clave</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-none bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Ejemplos de consultas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80">
            {['Buscá la orden 12345', 'Mostrame órdenes de Juan Pérez', '¿Qué órdenes están pendientes?', 'Buscá órdenes de Samsung TV que estén rechazadas', '¿Cuáles son los estados disponibles?'].map((example) => (
              <div key={example} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">{example}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {!isShowingOrderDetails && (
        <section className="rounded-[1.5rem] border border-slate-100 bg-white/95 px-6 py-6 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.4em] text-slate-400">Operaciones FastService</p>
              <h1 className="text-4xl font-semibold text-slate-900 leading-tight mt-2">Tablero de órdenes</h1>
              <p className="text-slate-500 mt-2">Usá FastService AI para filtrar órdenes, o explorá los resultados destacados.</p>
            </div>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full">
              Actualizado {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </Badge>
          </div>
          <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-4">
            {[{
              label: 'Órdenes activas',
              value: statusSnapshot.active,
              helper: 'requieren seguimiento',
              accent: 'text-emerald-600'
            }, {
              label: 'Pendientes de repuesto',
              value: statusSnapshot.awaiting,
              helper: 'esperando confirmación',
              accent: 'text-amber-600'
            }, {
              label: 'Completadas',
              value: statusSnapshot.completed,
              helper: 'listas para retiro',
              accent: 'text-slate-700'
            }, {
              label: 'Alertas',
              value: statusSnapshot.escalated,
              helper: 'requieren revisión',
              accent: 'text-rose-600'
            }].map((card) => (
              <Card key={card.label} className="border-none bg-slate-50/70 shadow-inner shadow-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500 font-medium">{card.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-semibold tracking-tight ${card.accent}`}>{card.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-2">{card.helper}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="flex-1 overflow-y-auto">
        {mainBodyContent}
      </div>
    </div>
  );
};

export default MainPanel;
