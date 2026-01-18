import React, { useState, useEffect, useCallback } from 'react';
import { OrderSummary, OrderDetails } from '../../types/order';
import { UserPermissions } from '../../types/auth';
import { OrderList, OrderDetailsView, OrderCreateView, OrderAdvancedSearch } from '../Orders';
import { KanbanBoard } from '../Kanban';
import { AccountingDashboard } from '../Accounting';
import { ClientsModule } from '../Clients';
import { WhatsAppTemplatesModule } from '../WhatsApp';
import { LoadingSpinner } from '../ui/loading-spinner';
import { openPrintWindow, ReceiptData } from '../Print';

export type MainView = 'kanban' | 'orders' | 'accounting' | 'clients' | 'search' | 'whatsapp';

interface MainPanelProps {
  orders?: OrderSummary[];
  selectedOrderDetails?: OrderDetails | null;
  isCreatingOrder?: boolean;
  isEditingOrder?: boolean;
  editingOrderDetails?: OrderDetails | null;
  activeView?: MainView;
  onCancelCreate?: () => void;
  onExitCreate?: () => void;
  onOrderSaved?: () => void;
  onOrderSelected?: (order: OrderDetails | null) => void;
  onCancelEdit?: () => void;
  onExitEdit?: () => void;
  onOrderUpdated?: () => void;
  onViewChange?: (view: MainView) => void;
  onEditOrder?: (order: OrderDetails) => void;
  permissions?: UserPermissions | null;
  userId?: number;
}

const MainPanel: React.FC<MainPanelProps> = ({ 
  orders, 
  selectedOrderDetails, 
  isCreatingOrder,
  isEditingOrder,
  editingOrderDetails,
  activeView = 'kanban',
  onCancelCreate,
  onExitCreate,
  onOrderSaved,
  onOrderSelected,
  onCancelEdit,
  onExitEdit,
  onOrderUpdated,
  onViewChange,
  onEditOrder,
  permissions,
  userId,
}) => {
  const [viewingOrderDetails, setViewingOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // When selectedOrderDetails changes from chat, update the view with visual feedback
  // But not when in search view - that handles its own order details
  useEffect(() => {
    if (selectedOrderDetails && activeView !== 'search') {
      // If we're already viewing an order, show a brief transition
      if (viewingOrderDetails && viewingOrderDetails.orderNumber !== selectedOrderDetails.orderNumber) {
        setIsTransitioning(true);
        // Brief delay to show loading state, making the change perceptible
        setTimeout(() => {
          setViewingOrderDetails(selectedOrderDetails);
          setIsTransitioning(false);
        }, 150);
      } else {
        setViewingOrderDetails(selectedOrderDetails);
      }
    }
  }, [selectedOrderDetails, activeView, viewingOrderDetails]);

  // When activeView changes to a non-orders view, clear order details
  useEffect(() => {
    if (activeView === 'accounting' || activeView === 'clients' || activeView === 'kanban' || activeView === 'whatsapp') {
      setViewingOrderDetails(null);
    }
  }, [activeView]);

  const handleOrderClick = async (orderNumber: number) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/${orderNumber}`);
      if (response.ok) {
        const orderDetails = await response.json();
        setViewingOrderDetails(orderDetails);
        // Notify parent so action suggestions appear in chat
        if (onOrderSelected) {
          onOrderSelected(orderDetails);
        }
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setViewingOrderDetails(null);
    // Clear selected order in chat
    if (onOrderSelected) {
      onOrderSelected(null);
    }
  };

  // Convert OrderDetails to ReceiptData for printing
  const getReceiptData = useCallback((order: OrderDetails): ReceiptData => {
    const fullAddress = order.customer.addressDetails?.fullAddress || order.customer.address || '';
    
    return {
      reparacionId: order.orderNumber,
      nombre: order.customer.fullName || `${order.customer.firstName} ${order.customer.lastName}`,
      telefono1: order.customer.phone || '',
      telefono2: order.customer.celular || '',
      direccion: fullAddress,
      creadoEn: order.entryDate || order.repair.entryDate || new Date().toISOString(),
      marca: order.device.brand || '',
      modelo: order.device.model || '',
      serie: order.device.serialNumber || '',
      comercio: '', // Not available in current OrderDetails, can be added later
      accesorios: order.device.accesorios || '',
      esGarantia: order.isGarantia,
    };
  }, []);

  const handlePrint = useCallback(() => {
    if (viewingOrderDetails) {
      openPrintWindow(getReceiptData(viewingOrderDetails), 'receipt');
    }
  }, [viewingOrderDetails, getReceiptData]);

  const handlePrintDorso = useCallback(() => {
    if (viewingOrderDetails) {
      openPrintWindow(getReceiptData(viewingOrderDetails), 'dorso');
    }
  }, [viewingOrderDetails, getReceiptData]);

  const handleSaveNewOrder = async (orderData: any) => {
    // Send the order data to the API
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al guardar la orden');
    }

    const createdOrder = await response.json();
    
    // Exit creation mode silently (without cancellation message)
    if (onExitCreate) {
      onExitCreate();
    }
    
    // Navigate to the created order details view
    setViewingOrderDetails(createdOrder);
    
    // Notify parent so action suggestions appear in chat
    if (onOrderSelected) {
      onOrderSelected(createdOrder);
    }
    
    // Notify parent (adds success message to chat)
    if (onOrderSaved) {
      onOrderSaved();
    }
  };

  const handleUpdateOrder = async (orderData: any, orderNumber: number) => {
    // Send the order data to the API
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/${orderNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al actualizar la orden');
    }

    const updatedOrder = await response.json();
    
    // Exit edit mode silently
    if (onExitEdit) {
      onExitEdit();
    }
    
    // Navigate to the updated order details view
    setViewingOrderDetails(updatedOrder);
    
    // Notify parent so action suggestions appear in chat
    if (onOrderSelected) {
      onOrderSelected(updatedOrder);
    }
    
    // Notify parent (adds success message to chat)
    if (onOrderUpdated) {
      onOrderUpdated();
    }
  };

  const isShowingOrderDetails = Boolean(viewingOrderDetails);
  let mainBodyContent: React.ReactNode;

  // Priority: Edit mode > Create mode > Search view > Order details > Order list > Accounting > Clients > Kanban
  // Note: Search view handles its own order details internally
  if (isEditingOrder && editingOrderDetails) {
    mainBodyContent = (
      <div className="p-4">
        <OrderCreateView 
          onCancel={onCancelEdit || (() => {})}
          onSave={(orderData) => handleUpdateOrder(orderData, editingOrderDetails.orderNumber)}
          editMode={true}
          existingOrder={editingOrderDetails}
        />
      </div>
    );
  } else if (isCreatingOrder) {
    mainBodyContent = (
      <div className="p-4">
        <OrderCreateView 
          onCancel={onCancelCreate || (() => {})}
          onSave={handleSaveNewOrder}
        />
      </div>
    );
  } else if (isTransitioning) {
    // Show brief loading state during order transition
    mainBodyContent = (
      <div className="p-4">
        <LoadingSpinner size="md" message="Cargando orden..." />
      </div>
    );
  } else if (activeView === 'search') {
    // Show Advanced Search view (handles its own order details internally)
    mainBodyContent = (
      <div className="h-full min-w-0 overflow-hidden p-4">
        <OrderAdvancedSearch onOrderSelected={onOrderSelected} permissions={permissions} userId={userId} />
      </div>
    );
  } else if (isShowingOrderDetails && viewingOrderDetails) {
    mainBodyContent = (
      <div className="p-4">
        <OrderDetailsView 
          order={viewingOrderDetails} 
          isLoading={isLoadingDetails}
          onBack={handleBackToList}
          onPrint={handlePrint}
          onPrintDorso={handlePrintDorso}
          onEdit={onEditOrder ? () => onEditOrder(viewingOrderDetails) : undefined}
          permissions={permissions}
          userId={userId}
          onOrderRefresh={(updatedOrder) => {
            setViewingOrderDetails(updatedOrder);
            // Also notify parent (chat) so everything stays in sync
            if (onOrderSelected) {
              onOrderSelected(updatedOrder);
            }
          }}
        />
      </div>
    );
  } else if (isLoadingDetails) {
    mainBodyContent = (
      <LoadingSpinner size="lg" message="Cargando detalles de orden..." />
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
  } else if (activeView === 'accounting') {
    // Show Accounting dashboard
    mainBodyContent = (
      <div className="h-full min-w-0 overflow-hidden">
        <AccountingDashboard />
      </div>
    );
  } else if (activeView === 'clients') {
    // Show Clients module
    mainBodyContent = (
      <div className="h-full min-w-0 overflow-hidden">
        <ClientsModule onViewOrder={handleOrderClick} />
      </div>
    );
  } else if (activeView === 'whatsapp') {
    // Show WhatsApp Templates management
    mainBodyContent = (
      <div className="h-full min-w-0 overflow-hidden">
        <WhatsAppTemplatesModule />
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
