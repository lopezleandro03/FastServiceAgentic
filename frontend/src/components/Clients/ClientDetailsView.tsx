import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Shield,
  ExternalLink
} from 'lucide-react';
import { getClientDetails } from '../../services/clientsApi';
import { ClientDetails } from '../../types/client';

interface ClientDetailsViewProps {
  clienteId: number;
  onBack: () => void;
  onViewOrder?: (orderNumber: number) => void;
}

const getStatusColor = (status: string): string => {
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'INGRESADO':
      return 'bg-blue-100 text-blue-800';
    case 'PRESUPUESTADO':
      return 'bg-yellow-100 text-yellow-800';
    case 'A REPARAR':
    case 'REINGRESADO':
      return 'bg-orange-100 text-orange-800';
    case 'ESP. REPUESTO':
      return 'bg-purple-100 text-purple-800';
    case 'REPARADO':
      return 'bg-green-100 text-green-800';
    case 'RETIRADO':
    case 'ENTREGADO':
      return 'bg-gray-100 text-gray-800';
    case 'RECHAZADO':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({ 
  clienteId, 
  onBack,
  onViewOrder 
}) => {
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getClientDetails(clienteId);
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cliente');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientDetails();
  }, [clienteId]);

  if (isLoading) {
    return (
      <LoadingSpinner size="lg" message="Cargando cliente..." fullHeight />
    );
  }

  if (error || !client) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error || 'Cliente no encontrado'}</div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const handleOrderClick = (orderNumber: number) => {
    if (onViewOrder) {
      onViewOrder(orderNumber);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      {/* Header with Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
      </div>

      {/* Client Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {client.apellido?.toUpperCase()}, {client.nombre}
                </CardTitle>
                <div className="text-sm text-gray-500 font-mono">
                  DNI: {client.dni || 'Sin DNI'}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Contacto</h3>
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              {client.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{client.telefono}</span>
                </div>
              )}
              {client.celular && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{client.celular} (Cel)</span>
                </div>
              )}
            </div>

            {/* Address Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Dirección</h3>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div>{client.direccion}</div>
                  {client.localidad && (
                    <div className="text-gray-500">{client.localidad}</div>
                  )}
                  {client.addressDetails && (
                    <div className="text-xs text-gray-400">
                      {client.addressDetails.calle && `${client.addressDetails.calle} ${client.addressDetails.altura || ''}`}
                      {client.addressDetails.ciudad && `, ${client.addressDetails.ciudad}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-2xl font-bold text-blue-600">{client.stats.totalOrders}</div>
                  <div className="text-xs text-gray-500">Total Órdenes</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-2xl font-bold text-green-600">{client.stats.completedOrders}</div>
                  <div className="text-xs text-gray-500">Completadas</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{client.stats.pendingOrders}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(client.stats.totalSpent)}</div>
                  <div className="text-xs text-gray-500">Total Gastado</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Historial de Órdenes</CardTitle>
            <Badge variant="secondary">{client.orders.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-24"># Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha Ingreso</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha Entrega</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Este cliente no tiene órdenes registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  client.orders.map((order) => (
                    <TableRow
                      key={order.orderNumber}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleOrderClick(order.orderNumber)}
                    >
                      <TableCell className="font-mono font-semibold text-blue-600">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {order.deviceType} {order.brand}
                        </div>
                        {order.model && (
                          <div className="text-xs text-gray-500">{order.model}</div>
                        )}
                        {order.isWarranty && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Garantía
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                        {formatDate(order.deliveredAt)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.finalPrice)}
                      </TableCell>
                      <TableCell>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailsView;
