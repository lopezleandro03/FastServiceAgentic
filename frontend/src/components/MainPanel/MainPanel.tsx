import React, { useState, useEffect } from 'react';
import { OrderSummary, OrderDetails } from '../../types/order';
import { OrderList, OrderDetailsView, OrderCreateView } from '../Orders';
import { KanbanBoard } from '../Kanban';

interface MainPanelProps {
  orders?: OrderSummary[];
  selectedOrderDetails?: OrderDetails | null;
  isCreatingOrder?: boolean;
  isEditingOrder?: boolean;
  editingOrderDetails?: OrderDetails | null;
  onCancelCreate?: () => void;
  onExitCreate?: () => void;
  onOrderSaved?: () => void;
  onOrderSelected?: (order: OrderDetails | null) => void;
  onCancelEdit?: () => void;
  onExitEdit?: () => void;
  onOrderUpdated?: () => void;
}

const MainPanel: React.FC<MainPanelProps> = ({ 
  orders, 
  selectedOrderDetails, 
  isCreatingOrder,
  isEditingOrder,
  editingOrderDetails,
  onCancelCreate,
  onExitCreate,
  onOrderSaved,
  onOrderSelected,
  onCancelEdit,
  onExitEdit,
  onOrderUpdated,
}) => {
  const [viewingOrderDetails, setViewingOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  const handlePrint = () => {
    if (viewingOrderDetails) {
      console.log(`Printing order #${viewingOrderDetails.orderNumber}`);
      // TODO: Integrate with actual print functionality
      alert(`📄 Imprimiendo formulario de orden #${viewingOrderDetails.orderNumber}`);
    }
  };

  const handlePrintDorso = () => {
    if (viewingOrderDetails) {
      console.log(`Printing dorso for order #${viewingOrderDetails.orderNumber}`);
      // TODO: Integrate with actual print functionality
      alert(`🖨️ Imprimiendo dorso de orden #${viewingOrderDetails.orderNumber}`);
    }
  };

  const handleSaveNewOrder = async (orderData: any) => {
    // Send the order data to the API
    const response = await fetch('http://localhost:5207/api/orders', {
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
    const response = await fetch(`http://localhost:5207/api/orders/${orderNumber}`, {
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

  // Priority: Edit mode > Create mode > Order details > Order list > Kanban
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
  } else if (isShowingOrderDetails && viewingOrderDetails) {
    mainBodyContent = (
      <div className="p-4">
        <OrderDetailsView 
          order={viewingOrderDetails} 
          isLoading={isLoadingDetails}
          onBack={handleBackToList}
          onPrint={handlePrint}
          onPrintDorso={handlePrintDorso}
        />
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
