import React from 'react';
import { OrderDetails } from '../../types/order';
import StatusBadge from './StatusBadge';
import NovedadesTable from './NovedadesTable';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { ArrowLeft, Printer } from 'lucide-react';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface OrderDetailsViewProps {
  order: OrderDetails | null;
  isLoading?: boolean;
  onBack?: () => void;
  onPrint?: () => void;
  onPrintDorso?: () => void;
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

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, isLoading, onBack, onPrint, onPrintDorso }) => {
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

  // Format phone number for WhatsApp (remove spaces, dashes, and ensure country code)
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, remove it (Argentina local format)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If doesn't have country code, add Argentina's code (54)
    if (!cleaned.startsWith('54')) {
      cleaned = '54' + cleaned;
    }
    
    return cleaned;
  };

  // Get customer phone number for WhatsApp (prioritize celular)
  const getWhatsAppPhone = (): string | null => {
    const phone = order?.customer?.celular || order?.customer?.phone;
    if (!phone) return null;
    return formatPhoneForWhatsApp(phone);
  };

  // Handle WhatsApp button click
  const handleWhatsAppClick = () => {
    const phone = getWhatsAppPhone();
    if (!phone) return;
    
    const customerName = order?.customer?.firstName || order?.customer?.fullName?.split(' ')[0] || 'cliente';
    const orderNumber = order?.orderNumber || '';
    
    const message = encodeURIComponent(
      `Hola ${customerName}, nos comunicamos de FastService respecto a su orden #${orderNumber}. ¿En qué podemos ayudarle?`
    );
    
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
        <div className="flex items-center gap-2">
          {getWhatsAppPhone() && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleWhatsAppClick}
              className="h-9 px-3 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
              title="Contactar por WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
          )}
          {onPrint && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrint}
              className="h-9 px-3"
              title="Imprimir formulario de orden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
          {onPrintDorso && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrintDorso}
              className="h-9 px-3"
              title="Imprimir etiqueta del dorso"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Dorso
            </Button>
          )}
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
