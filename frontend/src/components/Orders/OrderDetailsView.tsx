import React from 'react';
import { OrderDetails } from '../../types/order';
import StatusBadge from './StatusBadge';
import NovedadesTable from './NovedadesTable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface OrderDetailsViewProps {
  order: OrderDetails | null;
  isLoading?: boolean;
  onBack?: () => void;
}

// Compact field component for dense layout
const CompactField: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ 
  label, 
  value, 
  className = '' 
}) => (
  <div className={className}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm mt-0.5 truncate" title={value?.toString()}>
      {value || '-'}
    </p>
  </div>
);

// Loading skeleton for the compact view
const OrderDetailsSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-4">
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  </div>
);

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, isLoading, onBack }) => {
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No se encontró la orden</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al tablero
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Orden #{order.orderNumber}</h2>
            <StatusBadge status={order.status || order.repair?.status || 'Desconocido'} />
            {order.isDomicilio && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Domicilio
              </Badge>
            )}
            {order.isGarantia && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Garantía
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Order Header Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Información de la Orden
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <CompactField label="Fecha Estado" value={formatDateTime(order.statusDate)} />
            <CompactField label="Fecha Ingreso" value={formatDate(order.entryDate || order.repair?.entryDate)} />
            <CompactField label="Responsable" value={order.responsable?.fullName} />
            <CompactField label="Técnico" value={order.technician?.fullName} />
            <CompactField label="Presupuesto" value={formatCurrency(order.presupuesto || order.repair?.estimatedPrice)} />
            <CompactField label="Monto Final" value={formatCurrency(order.montoFinal || order.repair?.finalPrice)} />
          </div>
        </CardContent>
      </Card>

      {/* Customer Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <CompactField label="Documento" value={order.customer.dni} />
            <CompactField label="Nombre" value={order.customer.firstName || order.customer.fullName?.split(' ')[0]} />
            <CompactField label="Apellido" value={order.customer.lastName || order.customer.fullName?.split(' ').slice(1).join(' ')} />
            <CompactField label="Email" value={order.customer.email} />
            <CompactField label="Teléfono" value={order.customer.phone} />
            <CompactField label="Celular" value={order.customer.celular} />
          </div>
        </CardContent>
      </Card>

      {/* Address Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          {order.customer.addressDetails ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <CompactField label="Calle" value={order.customer.addressDetails.calle} />
              <CompactField label="Altura" value={order.customer.addressDetails.altura} />
              <CompactField label="Entre Calle 1" value={order.customer.addressDetails.entreCalle1} />
              <CompactField label="Entre Calle 2" value={order.customer.addressDetails.entreCalle2} />
              <CompactField label="Ciudad" value={order.customer.addressDetails.ciudad} />
              <CompactField label="Código Postal" value={order.customer.addressDetails.codigoPostal} />
            </div>
          ) : (
            <CompactField label="Dirección" value={order.customer.address} className="col-span-full" />
          )}
        </CardContent>
      </Card>

      {/* Device Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <CompactField label="Tipo" value={order.device.deviceType} />
            <CompactField label="Marca" value={order.device.brand} />
            <CompactField label="Nro. Serie" value={order.device.serialNumber} />
            <CompactField label="Modelo" value={order.device.model} />
            <CompactField label="Ubicación" value={order.device.ubicacion} />
            <CompactField label="Accesorios" value={order.device.accesorios} />
          </div>
        </CardContent>
      </Card>

      {/* Novedades Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Novedades ({order.novedades?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <NovedadesTable novedades={order.novedades || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailsView;
