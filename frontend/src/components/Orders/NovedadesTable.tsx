import React, { useState } from 'react';
import { NovedadInfo } from '../../types/order';
import { deleteNovedad } from '../../services/orderApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Button } from '../ui/button';
import { Trash2, Loader2, RefreshCw } from 'lucide-react';

interface NovedadesTableProps {
  novedades: NovedadInfo[];
  orderNumber?: number;
  onNovedadDeleted?: (novedadId: number) => void;
  onRefresh?: () => Promise<void>;
}

const NovedadesTable: React.FC<NovedadesTableProps> = ({ novedades, orderNumber, onNovedadDeleted, onRefresh }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDeleteNovedad = async (novedadId: number) => {
    if (!orderNumber) return;

    if (!window.confirm('¿Estás seguro de eliminar esta novedad?')) {
      return;
    }

    setDeletingId(novedadId);
    try {
      await deleteNovedad(orderNumber, novedadId);
      
      if (onRefresh) {
        await onRefresh();
      }

      if (onNovedadDeleted) {
        onNovedadDeleted(novedadId);
      }
    } catch (error) {
      console.error('Error deleting novedad:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la novedad');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string): string => {
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

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return '-';
    if (amount === 0) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  if (!novedades || novedades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Sin novedades registradas
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs"
          >
            {isRefreshing ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refrescar
          </Button>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative">
        {onRefresh && (
          <div className="absolute top-0 right-0 z-10 p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refrescar novedades</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className="max-h-64 overflow-y-auto border rounded-md">
          <Table>
          <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[140px]">Fecha</TableHead>
              <TableHead className="w-[100px]">Usuario</TableHead>
              <TableHead className="w-[140px]">Novedad</TableHead>
              <TableHead className="w-[100px] text-right">Monto</TableHead>
              <TableHead>Observación</TableHead>
              {orderNumber && <TableHead className="w-[60px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {novedades.map((novedad) => (
              <TableRow key={novedad.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(novedad.fecha)}
                </TableCell>
                <TableCell className="text-sm font-medium text-muted-foreground">
                  {novedad.usuarioNombre || '-'}
                </TableCell>
                <TableCell className="font-medium uppercase">
                  {novedad.tipo}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(novedad.monto)}
                </TableCell>
                <TableCell className="text-sm whitespace-pre-wrap break-words">
                  {novedad.observacion || '-'}
                </TableCell>
                {orderNumber && (
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteNovedad(novedad.id)}
                          disabled={deletingId === novedad.id}
                        >
                          {deletingId === novedad.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar novedad</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default NovedadesTable;
