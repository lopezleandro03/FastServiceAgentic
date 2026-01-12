import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Search, ChevronLeft, ChevronRight, User, Package, Mail } from 'lucide-react';
import { getClients } from '../../services/clientsApi';
import { ClientListItem, ClientsListResponse } from '../../types/client';
import ClientDetailsView from './ClientDetailsView';

interface ClientsModuleProps {
  onViewOrder?: (orderNumber: number) => void;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ onViewOrder }) => {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: ClientsListResponse = await getClients(search, pageNumber, pageSize);
      setClients(response.clients);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, pageNumber, pageSize]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPageNumber(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handleClientClick = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
  };

  const handleViewOrder = (orderNumber: number) => {
    if (onViewOrder) {
      onViewOrder(orderNumber);
    }
  };

  // If a client is selected, show details view
  if (selectedClientId) {
    return (
      <ClientDetailsView 
        clienteId={selectedClientId}
        onBack={handleBackToList}
        onViewOrder={handleViewOrder}
      />
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
          <span className="text-sm text-gray-500">({totalCount} total)</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por DNI, nombre, email, dirección o teléfono..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-24">DNI</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden xl:table-cell">Dirección</TableHead>
                  <TableHead className="text-center w-24">Órdenes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-0">
                      <LoadingSpinner size="md" message="Cargando clientes..." />
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow
                      key={client.clienteId}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleClientClick(client.clienteId)}
                    >
                      <TableCell className="font-mono text-sm">
                        {client.dni || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {client.apellido?.toUpperCase()}, {client.nombre}
                        </div>
                        <div className="text-xs text-gray-500 md:hidden">
                          {client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {client.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">
                        {client.email || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                        {client.telefono || client.celular || '-'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-gray-600 max-w-xs truncate">
                        {client.direccion || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-blue-600">{client.orderCount}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Mostrando {((pageNumber - 1) * pageSize) + 1} - {Math.min(pageNumber * pageSize, totalCount)} de {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pageNumber <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {pageNumber} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pageNumber >= totalPages || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsModule;
