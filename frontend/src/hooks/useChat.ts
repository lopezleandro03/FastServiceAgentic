import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat';
import { OrderSummary, OrderDetails } from '../types/order';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  orders: OrderSummary[];
  selectedOrderDetails: OrderDetails | null;
  isCreatingOrder: boolean;
  isEditingOrder: boolean;
  editingOrderDetails: OrderDetails | null;
  pendingNotaOrderNumber: number | null;
  pendingRetiraOrderNumber: number | null;
  retiraStep: 'monto' | 'metodo' | null;
  retiraMonto: number | null;
  paymentMethods: { id: number; nombre: string }[];
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
  clearMessages: () => void;
  startOrderCreation: () => void;
  cancelOrderCreation: () => void;
  exitOrderCreation: () => void;
  setSelectedOrder: (order: OrderDetails | null) => void;
  startOrderEdit: (order: OrderDetails) => void;
  cancelOrderEdit: () => void;
  exitOrderEdit: () => void;
  startAddNota: (orderNumber: number) => void;
  cancelAddNota: () => void;
  startRetira: (orderNumber: number) => void;
  cancelRetira: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderDetails, setEditingOrderDetails] = useState<OrderDetails | null>(null);
  const [pendingNotaOrderNumber, setPendingNotaOrderNumber] = useState<number | null>(null);
  const [pendingRetiraOrderNumber, _setPendingRetiraOrderNumber] = useState<number | null>(null);
  const [retiraStep, _setRetiraStep] = useState<'monto' | 'metodo' | null>(null);
  const [retiraMonto, _setRetiraMonto] = useState<number | null>(null);
  const [paymentMethods, _setPaymentMethods] = useState<{ id: number; nombre: string }[]>([]);

  const extractOrdersFromMessage = (message: string): OrderSummary[] => {
    // Try to extract JSON from the message
    const jsonMatch = message.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      console.log('No JSON block found in message');
      return [];
    }

    try {
      console.log('Parsing JSON:', jsonMatch[1]);
      const data = JSON.parse(jsonMatch[1]);
      
      // Check if it's an array of orders
      if (Array.isArray(data)) {
        const orders = data.map(item => ({
          orderNumber: item.orderNumber || item.OrderNumber || 0,
          customerName: item.customerName || item.CustomerName || '',
          deviceInfo: item.deviceInfo || item.DeviceInfo || `${item.brand || ''} ${item.deviceType || ''}`.trim(),
          status: item.status || item.Status || '',
          entryDate: item.entryDate || item.EntryDate || new Date().toISOString(),
          estimatedPrice: item.estimatedPrice || item.EstimatedPrice,
        }));
        console.log('Extracted orders:', orders);
        return orders;
      }
    } catch (error) {
      console.error('Failed to parse orders from message:', error);
    }

    return [];
  };

  const extractSingleOrderNumber = (message: string): number | null => {
    // Check if message indicates a single order was found
    const singleOrderPatterns = [
      /Order #(\d+)/i,
      /Orden #(\d+)/i,
      /order number[:\s]+(\d+)/i,
      /número de orden[:\s]+(\d+)/i,
    ];

    for (const pattern of singleOrderPatterns) {
      const match = message.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  };

  // Check if input is a # prefixed order number (fast lookup shortcut)
  const isOrderNumberShortcut = (input: string): number | null => {
    const trimmed = input.trim();
    // Match # followed by 4-7 digits (e.g., #128001)
    const match = trimmed.match(/^#(\d{4,7})$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Fast path: if input starts with #, bypass LLM and fetch order directly
    const orderNumberShortcut = isOrderNumberShortcut(content);
    if (orderNumberShortcut !== null) {
      try {
        const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${orderNumberShortcut}`);
        if (orderResponse.ok) {
          const orderDetails = await orderResponse.json();
          setSelectedOrderDetails(orderDetails);
          setOrders([]);
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ Orden #${orderNumberShortcut} encontrada.\n\n**Cliente:** ${orderDetails.customer?.fullName || 'N/A'}\n**Equipo:** ${orderDetails.device?.brand || ''} ${orderDetails.device?.deviceType || ''}\n**Estado:** ${orderDetails.status || 'N/A'}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else if (orderResponse.status === 404) {
          const notFoundMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No se encontró la orden #${orderNumberShortcut}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, notFoundMessage]);
        } else {
          throw new Error(`HTTP error: ${orderResponse.status}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al buscar la orden: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Check if we're in pending nota mode
    if (pendingNotaOrderNumber !== null) {
      try {
        // Add nota via API
        const response = await fetch(`${API_BASE_URL}/api/orders/${pendingNotaOrderNumber}/novedades`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipoNovedadId: 17, // NOTA type
            observacion: content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Error al guardar la nota');
        }

        const newMovement = await response.json();

        // Add success message
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `✅ **Nota agregada exitosamente** a la orden #${pendingNotaOrderNumber}\n\n> ${content.trim()}\n\n*Registrada por ${newMovement.createdBy} el ${new Date(newMovement.createdAt).toLocaleString('es-AR')}*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);

        // Refresh order details to update novedades table
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingNotaOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingNotaOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }

        // Clear pending nota state
        setPendingNotaOrderNumber(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al agregar la nota: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
        setPendingNotaOrderNumber(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'No response received',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Extract orders from the response if present
      const extractedOrders = extractOrdersFromMessage(data.message);
      console.log('Setting orders:', extractedOrders);
      
      // Check if this is a single order response
      const singleOrderNumber = extractSingleOrderNumber(data.message);
      
      if (singleOrderNumber && extractedOrders.length === 0) {
        // Single order - fetch details and show in detail view
        console.log('Single order detected:', singleOrderNumber);
        try {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${singleOrderNumber}`);
          if (orderResponse.ok) {
            const orderDetails = await orderResponse.json();
            setSelectedOrderDetails(orderDetails);
            setOrders([]); // Clear list view
          }
        } catch (err) {
          console.error('Failed to fetch order details:', err);
        }
      } else if (extractedOrders.length > 0) {
        // Multiple orders - show list view
        setOrders(extractedOrders);
        setSelectedOrderDetails(null); // Clear detail view
      } else {
        // No orders - clear both views
        setOrders([]);
        setSelectedOrderDetails(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const errorResponseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${errorMessage}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, pendingNotaOrderNumber, selectedOrderDetails]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setOrders([]);
    setSelectedOrderDetails(null);
    setIsCreatingOrder(false);
    setPendingNotaOrderNumber(null);
  }, []);

  const addMessage = useCallback((message: { role: 'assistant' | 'user'; content: string }) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.content,
      role: message.role,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const startOrderCreation = useCallback(() => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Quiero crear una nueva orden de reparación',
      role: 'user',
      timestamp: new Date(),
    };

    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: '¡Claro! Ingresa los datos de la nueva orden en el formulario. Completa la información del cliente, dispositivo y opciones de la orden.',
      role: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setOrders([]);
    setSelectedOrderDetails(null);
    setIsCreatingOrder(true);
  }, []);

  const cancelOrderCreation = useCallback(() => {
    setIsCreatingOrder(false);
    
    // Add cancellation message
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Creación de orden cancelada. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Exit creation mode silently (used after successful save)
  const exitOrderCreation = useCallback(() => {
    setIsCreatingOrder(false);
  }, []);

  // Start editing an existing order
  const startOrderEdit = useCallback((order: OrderDetails) => {
    setEditingOrderDetails(order);
    setIsEditingOrder(true);
    setSelectedOrderDetails(null);
  }, []);

  // Cancel order editing with message
  const cancelOrderEdit = useCallback(() => {
    setIsEditingOrder(false);
    setEditingOrderDetails(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Edición de orden cancelada. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Exit edit mode silently (used after successful save)
  const exitOrderEdit = useCallback(() => {
    setIsEditingOrder(false);
    setEditingOrderDetails(null);
  }, []);

  // Allow external components to set the selected order (for action suggestions)
  const setSelectedOrder = useCallback((order: OrderDetails | null) => {
    setSelectedOrderDetails(order);
  }, []);

  // Start adding a nota (conversational flow)
  const startAddNota = useCallback((orderNumber: number) => {
    setPendingNotaOrderNumber(orderNumber);
  }, []);

  // Cancel adding nota
  const cancelAddNota = useCallback(() => {
    setPendingNotaOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Nota cancelada. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    orders,
    selectedOrderDetails,
    isCreatingOrder,
    isEditingOrder,
    editingOrderDetails,
    pendingNotaOrderNumber,
    pendingRetiraOrderNumber,
    retiraStep,
    retiraMonto,
    paymentMethods,
    sendMessage,
    addMessage,
    clearMessages,
    startOrderCreation,
    cancelOrderCreation,
    exitOrderCreation,
    setSelectedOrder,
    startOrderEdit,
    cancelOrderEdit,
    exitOrderEdit,
    startAddNota,
    cancelAddNota,
    startRetira: () => {}, // Placeholder, not implemented yet
    cancelRetira: () => {}, // Placeholder, not implemented yet
  };
};
