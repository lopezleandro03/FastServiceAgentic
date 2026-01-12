import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '../ui/table';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SalesMovementsResponse } from '../../types/accounting';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SalesMovementsTableProps {
  movements: SalesMovementsResponse | null;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  title?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const SalesMovementsTable: React.FC<SalesMovementsTableProps> = ({
  movements,
  isLoading,
  onPageChange,
  title = 'Movimientos de Ventas',
}) => {
  if (isLoading && !movements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!movements || movements.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No se encontraron movimientos para el período seleccionado.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-sm text-gray-500">
            {movements.totalCount} {movements.totalCount === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead className="w-[90px]">Origen</TableHead>
                <TableHead className="w-[80px]">DNI</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right w-[100px]">Monto</TableHead>
                <TableHead className="hidden md:table-cell">Motivo</TableHead>
                <TableHead className="w-[100px]">Pago</TableHead>
                <TableHead className="w-[80px]">Factura</TableHead>
                <TableHead className="w-[90px]">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.items.map((movement) => (
                <TableRow key={movement.ventaId} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{movement.ventaId}</TableCell>
                  <TableCell className="text-sm">{movement.origin}</TableCell>
                  <TableCell className="text-sm">{movement.dni || '-'}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{movement.clientName}</span>
                    {movement.clientLastname && (
                      <span className="text-gray-600 ml-1">{movement.clientLastname}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(movement.amount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600 max-w-[200px] truncate" title={movement.description || ''}>
                    {movement.description || '-'}
                  </TableCell>
                  <TableCell className="text-sm">{movement.paymentMethod}</TableCell>
                  <TableCell className="text-sm">
                    {movement.invoiceNumber || (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(movement.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gray-100 font-semibold">
                <TableCell colSpan={4} className="text-right">
                  Total ({movements.totalCount} movimientos):
                </TableCell>
                <TableCell className="text-right text-green-700 font-bold">
                  {formatCurrency(movements.totalAmount)}
                </TableCell>
                <TableCell className="hidden md:table-cell"></TableCell>
                <TableCell colSpan={3} className="text-sm">
                  <div className="flex gap-4 justify-end">
                    <span className="text-purple-600">
                      Sin Fact: {formatCurrency(movements.totalWithoutInvoice)}
                    </span>
                    <span className="text-red-600">
                      Con Fact: {formatCurrency(movements.totalWithInvoice)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Pagination */}
        {movements.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Página {movements.page} de {movements.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(movements.page - 1)}
                disabled={movements.page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(movements.page + 1)}
                disabled={movements.page >= movements.totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesMovementsTable;
