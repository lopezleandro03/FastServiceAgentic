import React from 'react';
import { OrderDetails } from '../../types/order';
import StatusBadge from './StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

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

  const timeline = [
    { label: 'Ingreso', value: formatDate(order.repair.entryDate) },
    { label: 'Entrega Est.', value: formatDate(order.repair.estimatedDeliveryDate) },
    { label: 'Estado', value: order.repair.status },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-none bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-900 text-white">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Orden #{order.orderNumber}</p>
              <CardTitle className="text-3xl text-white">{order.customer.fullName}</CardTitle>
              <CardDescription className="text-white/70">
                Ingresado el {formatDate(order.repair.entryDate)}
              </CardDescription>
            </div>
            <StatusBadge status={order.repair.status} className="bg-white/10 text-white" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {timeline.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{item.label}</p>
              <p className="text-lg font-semibold text-white mt-1">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Customer Information Card */}
      <Card className="border border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="mt-1">{order.customer.fullName}</p>
            </div>
            {order.customer.dni && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">DNI</p>
                <p className="mt-1">{order.customer.dni}</p>
              </div>
            )}
            {order.customer.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="mt-1">{order.customer.phone}</p>
              </div>
            )}
            {order.customer.email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="mt-1">{order.customer.email}</p>
              </div>
            )}
            {order.customer.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                <p className="mt-1">{order.customer.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Information Card */}
      <Card className="border border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marca</p>
              <p className="mt-1">{order.device.brand}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p className="mt-1">{order.device.deviceType}</p>
            </div>
            {order.device.serialNumber && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Número de Serie</p>
                <p className="mt-1 font-mono">{order.device.serialNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repair Information Card */}
      <Card className="border border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Reparación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
              <p className="mt-1">{formatDate(order.repair.entryDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha Entrega Est.</p>
              <p className="mt-1">{formatDate(order.repair.estimatedDeliveryDate)}</p>
            </div>
            {order.repair.exitDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha Egreso</p>
                <p className="mt-1">{formatDate(order.repair.exitDate)}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Garantía</p>
              <div className="mt-1">
                <Badge variant={order.repair.underWarranty ? 'secondary' : 'outline'}>
                  {order.repair.underWarranty ? 'Activa' : 'No aplica'}
                </Badge>
              </div>
            </div>
            {order.repair.estimatedPrice && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio Estimado</p>
                <p className="mt-1 font-semibold">{formatCurrency(order.repair.estimatedPrice)}</p>
              </div>
            )}
            {order.repair.finalPrice && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio Final</p>
                <p className="mt-1 font-semibold text-green-600">{formatCurrency(order.repair.finalPrice)}</p>
              </div>
            )}
          </div>
          {order.repair.observations && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                <p className="mt-1 bg-muted p-3 rounded-md">{order.repair.observations}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Technician Information Card */}
      {order.technician && (
        <Card className="border border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Técnico Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                <p className="mt-1">{order.technician.fullName}</p>
              </div>
              {order.technician.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p className="mt-1">{order.technician.phone}</p>
                </div>
              )}
              {order.technician.email && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="mt-1">{order.technician.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repair Details Card */}
      {order.details && order.details.length > 0 && (
        <Card className="border border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Detalles de Reparación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Descripción</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Precio</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.details.map((detail, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{detail.description}</td>
                      <td className="px-4 py-2 text-sm text-right">{detail.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(detail.price)}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-right">{formatCurrency(detail.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailsView;
