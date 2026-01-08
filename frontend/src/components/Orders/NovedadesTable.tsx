import React from 'react';
import { NovedadInfo } from '../../types/order';
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

interface NovedadesTableProps {
  novedades: NovedadInfo[];
}

const NovedadesTable: React.FC<NovedadesTableProps> = ({ novedades }) => {
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

  const truncateText = (text: string | undefined, maxLength: number = 50): string => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!novedades || novedades.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Sin novedades registradas
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-h-64 overflow-y-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[140px]">Fecha</TableHead>
              <TableHead className="w-[140px]">Novedad</TableHead>
              <TableHead className="w-[100px] text-right">Monto</TableHead>
              <TableHead>Observación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {novedades.map((novedad) => (
              <TableRow key={novedad.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(novedad.fecha)}
                </TableCell>
                <TableCell className="font-medium">
                  {novedad.tipo}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatCurrency(novedad.monto)}
                </TableCell>
                <TableCell className="text-sm">
                  {novedad.observacion && novedad.observacion.length > 50 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {truncateText(novedad.observacion)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="whitespace-pre-wrap">{novedad.observacion}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    truncateText(novedad.observacion)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default NovedadesTable;
