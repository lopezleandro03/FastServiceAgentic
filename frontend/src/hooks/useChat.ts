import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat';
import { OrderSummary, OrderDetails } from '../types/order';
import { 
  fetchPaymentMethods, 
  processRetira, 
  processSena, 
  processInformarPresupuesto, 
  processReingreso, 
  processRechazaPresupuesto,
  processPresupuesto,
  processReparado,
  processRechazar,
  processEsperaRepuesto,
  processRepDomicilio,
  PaymentMethod 
} from '../services/orderApi';

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
  pendingSenaOrderNumber: number | null;
  senaStep: 'monto' | 'metodo' | null;
  senaMonto: number | null;
  pendingInformarPresupOrderNumber: number | null;
  informarPresupStep: 'accion' | 'monto' | null;
  informarPresupAccion: 'acepta' | 'rechaza' | 'confirma' | null;
  pendingReingresoOrderNumber: number | null;
  pendingRechazaPresupOrderNumber: number | null; // Client rejects budget
  // Técnico action states
  pendingPresupuestoOrderNumber: number | null;
  pendingReparadoOrderNumber: number | null;
  pendingRechazarOrderNumber: number | null;
  pendingEsperaRepuestoOrderNumber: number | null;
  pendingRepDomicilioOrderNumber: number | null;
  repDomicilioStep: 'monto' | 'metodo' | null;
  repDomicilioMonto: number | null;
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
  startRetira: (orderNumber: number, presupuesto?: number) => void;
  cancelRetira: () => void;
  startSena: (orderNumber: number) => void;
  cancelSena: () => void;
  startInformarPresup: (orderNumber: number, presupuesto?: number) => void;
  cancelInformarPresup: () => void;
  startReingreso: (orderNumber: number) => void;
  cancelReingreso: () => void;
  startRechazaPresup: (orderNumber: number) => void; // Client rejects budget
  cancelRechazaPresup: () => void;
  // Técnico action functions
  startPresupuesto: (orderNumber: number) => void;
  cancelPresupuesto: () => void;
  startReparado: (orderNumber: number) => void;
  cancelReparado: () => void;
  startRechazar: (orderNumber: number) => void;
  cancelRechazar: () => void;
  startEsperaRepuesto: (orderNumber: number) => void;
  cancelEsperaRepuesto: () => void;
  startRepDomicilio: (orderNumber: number) => void;
  cancelRepDomicilio: () => void;
}

interface UseChatOptions {
  canAccessAccounting?: boolean;
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const { canAccessAccounting = false } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderDetails, setEditingOrderDetails] = useState<OrderDetails | null>(null);
  const [pendingNotaOrderNumber, setPendingNotaOrderNumber] = useState<number | null>(null);
  const [pendingRetiraOrderNumber, setPendingRetiraOrderNumber] = useState<number | null>(null);
  const [retiraStep, setRetiraStep] = useState<'monto' | 'metodo' | null>(null);
  const [retiraMonto, setRetiraMonto] = useState<number | null>(null);
  const [retiraPresupuesto, setRetiraPresupuesto] = useState<number | null>(null);
  const [pendingSenaOrderNumber, setPendingSenaOrderNumber] = useState<number | null>(null);
  const [senaStep, setSenaStep] = useState<'monto' | 'metodo' | null>(null);
  const [senaMonto, setSenaMonto] = useState<number | null>(null);
  const [pendingInformarPresupOrderNumber, setPendingInformarPresupOrderNumber] = useState<number | null>(null);
  const [informarPresupStep, setInformarPresupStep] = useState<'accion' | 'monto' | null>(null);
  const [informarPresupAccion, setInformarPresupAccion] = useState<'acepta' | 'rechaza' | 'confirma' | null>(null);
  const [informarPresupPresupuesto, setInformarPresupPresupuesto] = useState<number | null>(null);
  const [pendingReingresoOrderNumber, setPendingReingresoOrderNumber] = useState<number | null>(null);
  const [pendingRechazaPresupOrderNumber, setPendingRechazaPresupOrderNumber] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  // Técnico action states
  const [pendingPresupuestoOrderNumber, setPendingPresupuestoOrderNumber] = useState<number | null>(null);
  const [pendingReparadoOrderNumber, setPendingReparadoOrderNumber] = useState<number | null>(null);
  const [pendingRechazarOrderNumber, setPendingRechazarOrderNumber] = useState<number | null>(null);
  const [pendingEsperaRepuestoOrderNumber, setPendingEsperaRepuestoOrderNumber] = useState<number | null>(null);
  const [pendingRepDomicilioOrderNumber, setPendingRepDomicilioOrderNumber] = useState<number | null>(null);
  const [repDomicilioStep, setRepDomicilioStep] = useState<'monto' | 'metodo' | null>(null);
  const [repDomicilioMonto, setRepDomicilioMonto] = useState<number | null>(null);

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

    // Check if we're in pending retira mode
    if (pendingRetiraOrderNumber !== null && retiraStep !== null) {
      const trimmedContent = content.trim().toLowerCase();
      
      if (retiraStep === 'monto') {
        // User is answering about the monto
        let montoToUse: number | null = null;
        
        // Check if user wants to use presupuesto
        if (trimmedContent === 'si' || trimmedContent === 'sí' || trimmedContent === 's' || trimmedContent === 'yes' || trimmedContent === '1') {
          montoToUse = retiraPresupuesto;
        } else {
          // Try to parse as number
          const parsedMonto = parseFloat(content.replace(/[^0-9.,]/g, '').replace(',', '.'));
          if (!isNaN(parsedMonto) && parsedMonto > 0) {
            montoToUse = parsedMonto;
          }
        }
        
        if (montoToUse === null || montoToUse <= 0) {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No pude entender el monto. Por favor responde **"sí"** para usar el presupuesto de $${retiraPresupuesto?.toLocaleString('es-AR') || '0'}, o ingresa el monto final (ej: 25000):`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        setRetiraMonto(montoToUse);
        setRetiraStep('metodo');
        
        // Fetch payment methods and ask for selection
        try {
          const methods = await fetchPaymentMethods();
          setPaymentMethods(methods);
          
          const methodsList = methods.map((m, idx) => `**${idx + 1}.** ${m.nombre}`).join('\n');
          const metodosMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ Monto: **$${montoToUse.toLocaleString('es-AR')}**\n\n¿Con qué método de pago se realizó el cobro?\n\n${methodsList}\n\n*Ingresa el número o nombre del método de pago:*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, metodosMessage]);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al obtener métodos de pago: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
          // Reset retira state
          setPendingRetiraOrderNumber(null);
          setRetiraStep(null);
          setRetiraMonto(null);
          setRetiraPresupuesto(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      if (retiraStep === 'metodo') {
        // User is selecting payment method
        let selectedMethod: PaymentMethod | null = null;
        
        // Try to match by number
        const methodIndex = parseInt(trimmedContent) - 1;
        if (!isNaN(methodIndex) && methodIndex >= 0 && methodIndex < paymentMethods.length) {
          selectedMethod = paymentMethods[methodIndex];
        } else {
          // Try to match by name
          selectedMethod = paymentMethods.find(
            m => m.nombre.toLowerCase().includes(trimmedContent) || trimmedContent.includes(m.nombre.toLowerCase())
          ) || null;
        }
        
        if (!selectedMethod) {
          const methodsList = paymentMethods.map((m, idx) => `**${idx + 1}.** ${m.nombre}`).join('\n');
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No reconocí ese método de pago. Por favor selecciona uno de la lista:\n\n${methodsList}\n\n*Ingresa el número o nombre del método:*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        // Process the retira
        try {
          const result = await processRetira(pendingRetiraOrderNumber, {
            monto: retiraMonto!,
            metodoPagoId: selectedMethod.id,
            facturado: false, // Default to non-invoiced for now
          });
          
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ **¡Orden retirada exitosamente!**\n\n📋 **Orden #${result.orderNumber}**\n💰 **Monto:** $${result.montoRegistrado.toLocaleString('es-AR')}\n💳 **Método de pago:** ${result.metodoPago}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*La venta ha sido registrada en la contabilidad del día.*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, successMessage]);
          
          // Refresh order details to show updated status
          if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingRetiraOrderNumber) {
            const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingRetiraOrderNumber}`);
            if (orderResponse.ok) {
              const updatedOrder = await orderResponse.json();
              setSelectedOrderDetails(updatedOrder);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al procesar el retiro: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
        } finally {
          // Reset retira state
          setPendingRetiraOrderNumber(null);
          setRetiraStep(null);
          setRetiraMonto(null);
          setRetiraPresupuesto(null);
          setPaymentMethods([]);
          setIsLoading(false);
        }
        return;
      }
    }

    // Check if we're in pending seña mode
    if (pendingSenaOrderNumber !== null && senaStep !== null) {
      const trimmedContent = content.trim().toLowerCase();
      
      if (senaStep === 'monto') {
        // User is entering the seña amount
        const parsedMonto = parseFloat(content.replace(/[^0-9.,]/g, '').replace(',', '.'));
        
        if (isNaN(parsedMonto) || parsedMonto <= 0) {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No pude entender el monto. Por favor ingresa el monto de la seña (ej: 15000):`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        setSenaMonto(parsedMonto);
        setSenaStep('metodo');
        
        // Fetch payment methods and ask for selection
        try {
          const methods = await fetchPaymentMethods();
          setPaymentMethods(methods);
          
          const methodsList = methods.map((m, idx) => `**${idx + 1}.** ${m.nombre}`).join('\n');
          const metodosMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ Monto de seña: **$${parsedMonto.toLocaleString('es-AR')}**\n\n¿Con qué método de pago se recibió la seña?\n\n${methodsList}\n\n*Ingresa el número o nombre del método de pago:*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, metodosMessage]);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al obtener métodos de pago: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
          // Reset seña state
          setPendingSenaOrderNumber(null);
          setSenaStep(null);
          setSenaMonto(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      if (senaStep === 'metodo') {
        // User is selecting payment method
        let selectedMethod: PaymentMethod | null = null;
        
        // Try to match by number
        const methodIndex = parseInt(trimmedContent) - 1;
        if (!isNaN(methodIndex) && methodIndex >= 0 && methodIndex < paymentMethods.length) {
          selectedMethod = paymentMethods[methodIndex];
        } else {
          // Try to match by name
          selectedMethod = paymentMethods.find(
            m => m.nombre.toLowerCase().includes(trimmedContent) || trimmedContent.includes(m.nombre.toLowerCase())
          ) || null;
        }
        
        if (!selectedMethod) {
          const methodsList = paymentMethods.map((m, idx) => `**${idx + 1}.** ${m.nombre}`).join('\n');
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No reconocí ese método de pago. Por favor selecciona uno de la lista:\n\n${methodsList}\n\n*Ingresa el número o nombre del método:*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        // Process the seña
        try {
          const result = await processSena(pendingSenaOrderNumber, {
            monto: senaMonto!,
            metodoPagoId: selectedMethod.id,
            facturado: false, // Default to non-invoiced for now
          });
          
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ **¡Seña registrada exitosamente!**\n\n📋 **Orden #${result.orderNumber}**\n💵 **Monto de seña:** $${result.montoRegistrado.toLocaleString('es-AR')}\n💳 **Método de pago:** ${result.metodoPago}\n📊 **Estado actual:** ${result.currentStatus}\n\n*La seña ha sido registrada en la contabilidad del día y documentada en las novedades de la orden.*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, successMessage]);
          
          // Refresh order details to show updated novedades
          if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingSenaOrderNumber) {
            const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingSenaOrderNumber}`);
            if (orderResponse.ok) {
              const updatedOrder = await orderResponse.json();
              setSelectedOrderDetails(updatedOrder);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al procesar la seña: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
        } finally {
          // Reset seña state
          setPendingSenaOrderNumber(null);
          setSenaStep(null);
          setSenaMonto(null);
          setPaymentMethods([]);
          setIsLoading(false);
        }
        return;
      }
    }

    // Check if we're in pending informar presupuesto mode
    if (pendingInformarPresupOrderNumber !== null && informarPresupStep !== null) {
      const trimmedContent = content.trim().toLowerCase();
      
      if (informarPresupStep === 'accion') {
        // User is selecting the action (acepta/rechaza/confirma)
        let accion: 'acepta' | 'rechaza' | 'confirma' | null = null;
        
        // Match by number or text
        if (trimmedContent === '1' || trimmedContent.includes('acept') || trimmedContent.includes('si') || trimmedContent === 'sí') {
          accion = 'acepta';
        } else if (trimmedContent === '2' || trimmedContent.includes('rechaz') || trimmedContent.includes('no')) {
          accion = 'rechaza';
        } else if (trimmedContent === '3' || trimmedContent.includes('confirm') || trimmedContent.includes('pend')) {
          accion = 'confirma';
        }
        
        if (!accion) {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No reconocí esa opción. Por favor selecciona:\n\n**1.** ✅ Acepta - El cliente acepta el presupuesto\n**2.** ❌ Rechaza - El cliente rechaza el presupuesto\n**3.** ⏳ A Confirmar - Pendiente de confirmación`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        setInformarPresupAccion(accion);
        setInformarPresupStep('monto');
        
        // Ask for the quote amount
        const montoMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `Respuesta del cliente: **${accion === 'acepta' ? '✅ Acepta' : accion === 'rechaza' ? '❌ Rechaza' : '⏳ A Confirmar'}**\n\n${
            informarPresupPresupuesto && informarPresupPresupuesto > 0 
              ? `El presupuesto actual es **$${informarPresupPresupuesto.toLocaleString('es-AR')}**.\n\n¿Es este el monto final? Responde **"sí"** o ingresa un nuevo monto:`
              : `¿Cuál es el monto del presupuesto? (ej: 25000):`
          }`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, montoMessage]);
        setIsLoading(false);
        return;
      }
      
      if (informarPresupStep === 'monto') {
        // User is entering/confirming the quote amount
        let montoToUse: number | null = null;
        
        // Check if user wants to use current presupuesto
        if (trimmedContent === 'si' || trimmedContent === 'sí' || trimmedContent === 's' || trimmedContent === 'yes' || trimmedContent === '1') {
          montoToUse = informarPresupPresupuesto;
        } else {
          // Try to parse as number
          const parsedMonto = parseFloat(content.replace(/[^0-9.,]/g, '').replace(',', '.'));
          if (!isNaN(parsedMonto) && parsedMonto > 0) {
            montoToUse = parsedMonto;
          }
        }
        
        // For "rechaza" action, monto is not required
        if (informarPresupAccion === 'rechaza' && (montoToUse === null || montoToUse <= 0)) {
          montoToUse = informarPresupPresupuesto || 0;
        }
        
        if ((montoToUse === null || montoToUse <= 0) && informarPresupAccion !== 'rechaza') {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No pude entender el monto. ${
              informarPresupPresupuesto && informarPresupPresupuesto > 0
                ? `Responde **"sí"** para usar $${informarPresupPresupuesto.toLocaleString('es-AR')}, o ingresa el nuevo monto:`
                : `Por favor ingresa el monto del presupuesto (ej: 25000):`
            }`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        // Process the informar presupuesto
        try {
          const result = await processInformarPresupuesto(pendingInformarPresupOrderNumber, {
            accion: informarPresupAccion!,
            monto: montoToUse || undefined,
            observacion: `Presupuesto informado - Cliente ${informarPresupAccion}`,
          });
          
          const accionEmoji = informarPresupAccion === 'acepta' ? '✅' : informarPresupAccion === 'rechaza' ? '❌' : '⏳';
          const accionText = informarPresupAccion === 'acepta' ? 'aceptó' : informarPresupAccion === 'rechaza' ? 'rechazó' : 'confirmación pendiente';
          
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `${accionEmoji} **¡Presupuesto informado exitosamente!**\n\n📋 **Orden #${result.orderNumber}**\n💰 **Presupuesto:** $${result.presupuesto.toLocaleString('es-AR')}\n📝 **Respuesta:** Cliente ${accionText}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*La novedad ha sido registrada.*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, successMessage]);
          
          // Refresh order details to show updated status
          if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingInformarPresupOrderNumber) {
            const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingInformarPresupOrderNumber}`);
            if (orderResponse.ok) {
              const updatedOrder = await orderResponse.json();
              setSelectedOrderDetails(updatedOrder);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al procesar informar presupuesto: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
        } finally {
          // Reset informar presupuesto state
          setPendingInformarPresupOrderNumber(null);
          setInformarPresupStep(null);
          setInformarPresupAccion(null);
          setInformarPresupPresupuesto(null);
          setIsLoading(false);
        }
        return;
      }
    }

    // Check if we're in pending reingreso mode
    if (pendingReingresoOrderNumber !== null) {
      const trimmedContent = content.trim();
      
      if (trimmedContent.length < 3) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ La observación es muy corta. Por favor describe el motivo del reingreso:`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
      
      // Process the reingreso
      try {
        const result = await processReingreso(pendingReingresoOrderNumber, {
          observacion: trimmedContent,
        });
        
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `🔄 **¡Reingreso registrado exitosamente!**\n\n📋 **Orden #${result.orderNumber}**\n📝 **Observación:** ${result.observacion}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*El reingreso ha sido documentado en las novedades de la orden.*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Refresh order details to show updated status
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingReingresoOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingReingresoOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al procesar el reingreso: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        // Reset reingreso state
        setPendingReingresoOrderNumber(null);
        setIsLoading(false);
      }
      return;
    }

    // Check if we're in pending rechaza presupuesto mode (CLIENT rejects budget)
    if (pendingRechazaPresupOrderNumber !== null) {
      const trimmedContent = content.trim().toLowerCase();
      
      // If user says "no", process without observation
      const observacion = (trimmedContent === 'no' || trimmedContent === 'n') 
        ? undefined 
        : content.trim();
      
      // Process the rechaza presupuesto
      try {
        const result = await processRechazaPresupuesto(pendingRechazaPresupOrderNumber, {
          observacion: observacion,
        });
        
        const observacionText = observacion ? `\n📝 **Observación:** ${observacion}` : '';
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `🚫 **¡Rechazo de presupuesto registrado!**\n\n📋 **Orden #${result.orderNumber}**${observacionText}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*El cliente ha rechazado el presupuesto. La orden aparecerá en la columna "Rechazado (cliente)".*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Refresh order details to show updated status
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingRechazaPresupOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingRechazaPresupOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al procesar el rechazo: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        // Reset rechaza presup state
        setPendingRechazaPresupOrderNumber(null);
        setIsLoading(false);
      }
      return;
    }

    // ============= TÉCNICO ACTIONS =============

    // Check if we're in pending presupuesto mode (TECHNICIAN creates budget)
    if (pendingPresupuestoOrderNumber !== null) {
      const trimmedContent = content.trim();
      
      // Try to parse as number
      const parsedMonto = parseFloat(trimmedContent.replace(/[^0-9.,]/g, '').replace(',', '.'));
      
      if (isNaN(parsedMonto) || parsedMonto <= 0) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ No pude entender el monto. Por favor ingresa el monto del presupuesto (ej: 25000):`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
      
      // Process the presupuesto
      try {
        const result = await processPresupuesto(pendingPresupuestoOrderNumber, {
          monto: parsedMonto,
        });
        
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `💰 **¡Presupuesto creado exitosamente!**\n\n📋 **Orden #${result.orderNumber}**\n💵 **Monto:** $${result.monto.toLocaleString('es-AR')}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*El presupuesto ha sido registrado. Ahora se puede informar al cliente.*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Refresh order details to show updated status
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingPresupuestoOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingPresupuestoOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al crear el presupuesto: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        setPendingPresupuestoOrderNumber(null);
        setIsLoading(false);
      }
      return;
    }

    // Check if we're in pending reparado mode (TECHNICIAN marks as repaired)
    if (pendingReparadoOrderNumber !== null) {
      const trimmedContent = content.trim().toLowerCase();
      
      // "no" means no observation
      const observacion = (trimmedContent === 'no' || trimmedContent === 'n') 
        ? undefined 
        : content.trim();
      
      // Process the reparado
      try {
        const result = await processReparado(pendingReparadoOrderNumber, {
          observacion: observacion,
        });
        
        const observacionText = observacion ? `\n📝 **Observación:** ${observacion}` : '';
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `✅ **¡Equipo marcado como reparado!**\n\n📋 **Orden #${result.orderNumber}**${observacionText}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*El equipo está listo para ser retirado por el cliente.*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Refresh order details
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingReparadoOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingReparadoOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al marcar como reparado: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        setPendingReparadoOrderNumber(null);
        setIsLoading(false);
      }
      return;
    }

    // Check if we're in pending rechazar mode (TECHNICIAN can't repair)
    if (pendingRechazarOrderNumber !== null) {
      const trimmedContent = content.trim();
      
      if (trimmedContent.length < 5) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ La observación es muy corta. Por favor describe el motivo del rechazo (ej: "Sin repuestos disponibles", "No reparable"):`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
      
      // Process the rechazar
      try {
        const result = await processRechazar(pendingRechazarOrderNumber, {
          observacion: trimmedContent,
        });
        
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `🔧 **¡Rechazo técnico registrado!**\n\n📋 **Orden #${result.orderNumber}**\n📝 **Motivo:** ${trimmedContent}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*La orden aparecerá en la columna "Rechazado (técnico)".*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Refresh order details
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingRechazarOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingRechazarOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al procesar el rechazo: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        setPendingRechazarOrderNumber(null);
        setIsLoading(false);
      }
      return;
    }

    // Check if we're in pending espera repuesto mode (TECHNICIAN waiting for parts)
    if (pendingEsperaRepuestoOrderNumber !== null) {
      const trimmedContent = content.trim();
      
      if (trimmedContent.length < 3) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ La descripción es muy corta. Por favor describe qué repuesto se necesita (ej: "Pantalla LCD", "Batería original"):`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
      
      // Process the espera repuesto
      try {
        const result = await processEsperaRepuesto(pendingEsperaRepuestoOrderNumber, {
          observacion: trimmedContent,
        });
        
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `⏳ **¡Espera de repuesto registrada!**\n\n📋 **Orden #${result.orderNumber}**\n🔧 **Repuesto:** ${trimmedContent}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*La orden quedará pendiente hasta recibir el repuesto.*`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Refresh order details
        if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingEsperaRepuestoOrderNumber) {
          const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingEsperaRepuestoOrderNumber}`);
          if (orderResponse.ok) {
            const updatedOrder = await orderResponse.json();
            setSelectedOrderDetails(updatedOrder);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        const errorResponseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ Error al registrar espera de repuesto: ${errorMessage}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponseMessage]);
      } finally {
        setPendingEsperaRepuestoOrderNumber(null);
        setIsLoading(false);
      }
      return;
    }

    // Check if we're in pending rep domicilio mode (TECHNICIAN home repair)
    if (pendingRepDomicilioOrderNumber !== null && repDomicilioStep !== null) {
      const trimmedContent = content.trim().toLowerCase();
      
      if (repDomicilioStep === 'monto') {
        // User is entering the amount
        const parsedMonto = parseFloat(content.replace(/[^0-9.,]/g, '').replace(',', '.'));
        
        if (isNaN(parsedMonto) || parsedMonto <= 0) {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No pude entender el monto. Por favor ingresa el monto cobrado (ej: 25000):`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        setRepDomicilioMonto(parsedMonto);
        setRepDomicilioStep('metodo');
        
        // Fetch payment methods
        try {
          const methods = await fetchPaymentMethods();
          setPaymentMethods(methods);
          
          const methodsList = methods.map((m, idx) => `**${idx + 1}.** ${m.nombre}`).join('\n');
          const metodosMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ Monto: **$${parsedMonto.toLocaleString('es-AR')}**\n\n¿Con qué método de pago se realizó el cobro?\n\n${methodsList}\n\n*Ingresa el número o nombre del método de pago:*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, metodosMessage]);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al obtener métodos de pago: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
          setPendingRepDomicilioOrderNumber(null);
          setRepDomicilioStep(null);
          setRepDomicilioMonto(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      if (repDomicilioStep === 'metodo') {
        // User is selecting payment method
        let selectedMethod: PaymentMethod | null = null;
        
        const methodIndex = parseInt(trimmedContent) - 1;
        if (!isNaN(methodIndex) && methodIndex >= 0 && methodIndex < paymentMethods.length) {
          selectedMethod = paymentMethods[methodIndex];
        } else {
          selectedMethod = paymentMethods.find(
            m => m.nombre.toLowerCase().includes(trimmedContent) || trimmedContent.includes(m.nombre.toLowerCase())
          ) || null;
        }
        
        if (!selectedMethod) {
          const methodsList = paymentMethods.map((m, idx) => `**${idx + 1}.** ${m.nombre}`).join('\n');
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ No reconocí ese método de pago. Por favor selecciona uno de la lista:\n\n${methodsList}\n\n*Ingresa el número o nombre del método:*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        
        // Process the rep domicilio
        try {
          const result = await processRepDomicilio(pendingRepDomicilioOrderNumber, {
            monto: repDomicilioMonto!,
            metodoPagoId: selectedMethod.id,
            facturado: false,
          });
          
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `🏠 **¡Reparación a domicilio completada!**\n\n📋 **Orden #${result.orderNumber}**\n💰 **Monto:** $${result.monto.toLocaleString('es-AR')}\n💳 **Método de pago:** ${paymentMethods.find(m => m.id === selectedMethod!.id)?.nombre || 'N/A'}\n📊 **Estado anterior:** ${result.previousStatus}\n📊 **Nuevo estado:** ${result.newStatus}\n\n*La venta ha sido registrada en la contabilidad del día.*`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, successMessage]);
          
          // Refresh order details
          if (selectedOrderDetails && selectedOrderDetails.orderNumber === pendingRepDomicilioOrderNumber) {
            const orderResponse = await fetch(`${API_BASE_URL}/api/orders/${pendingRepDomicilioOrderNumber}`);
            if (orderResponse.ok) {
              const updatedOrder = await orderResponse.json();
              setSelectedOrderDetails(updatedOrder);
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          const errorResponseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `❌ Error al procesar rep. domicilio: ${errorMessage}`,
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorResponseMessage]);
        } finally {
          setPendingRepDomicilioOrderNumber(null);
          setRepDomicilioStep(null);
          setRepDomicilioMonto(null);
          setPaymentMethods([]);
          setIsLoading(false);
        }
        return;
      }
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
          })),
          canAccessAccounting
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
  }, [isLoading, pendingNotaOrderNumber, pendingRetiraOrderNumber, retiraStep, retiraMonto, retiraPresupuesto, pendingSenaOrderNumber, senaStep, senaMonto, pendingInformarPresupOrderNumber, informarPresupStep, informarPresupAccion, informarPresupPresupuesto, pendingReingresoOrderNumber, pendingRechazaPresupOrderNumber, pendingPresupuestoOrderNumber, pendingReparadoOrderNumber, pendingRechazarOrderNumber, pendingEsperaRepuestoOrderNumber, pendingRepDomicilioOrderNumber, repDomicilioStep, repDomicilioMonto, paymentMethods, selectedOrderDetails]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setOrders([]);
    setSelectedOrderDetails(null);
    setIsCreatingOrder(false);
    setPendingNotaOrderNumber(null);
    setPendingRetiraOrderNumber(null);
    setRetiraStep(null);
    setRetiraMonto(null);
    setRetiraPresupuesto(null);
    setPendingSenaOrderNumber(null);
    setSenaStep(null);
    setSenaMonto(null);
    setPaymentMethods([]);
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

  // Start retira flow (conversational)
  const startRetira = useCallback((orderNumber: number, presupuesto?: number) => {
    setPendingRetiraOrderNumber(orderNumber);
    setRetiraStep('monto');
    setRetiraPresupuesto(presupuesto || 0);
  }, []);

  // Cancel retira flow
  const cancelRetira = useCallback(() => {
    setPendingRetiraOrderNumber(null);
    setRetiraStep(null);
    setRetiraMonto(null);
    setRetiraPresupuesto(null);
    setPaymentMethods([]);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Retiro cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start seña flow (conversational)
  const startSena = useCallback((orderNumber: number) => {
    setPendingSenaOrderNumber(orderNumber);
    setSenaStep('monto');
  }, []);

  // Cancel seña flow
  const cancelSena = useCallback(() => {
    setPendingSenaOrderNumber(null);
    setSenaStep(null);
    setSenaMonto(null);
    setPaymentMethods([]);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Seña cancelada. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start informar presupuesto flow (conversational)
  const startInformarPresup = useCallback((orderNumber: number, presupuesto?: number) => {
    setPendingInformarPresupOrderNumber(orderNumber);
    setInformarPresupStep('accion');
    setInformarPresupPresupuesto(presupuesto || 0);
  }, []);

  // Cancel informar presupuesto flow
  const cancelInformarPresup = useCallback(() => {
    setPendingInformarPresupOrderNumber(null);
    setInformarPresupStep(null);
    setInformarPresupAccion(null);
    setInformarPresupPresupuesto(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Informar presupuesto cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start reingreso flow (conversational)
  const startReingreso = useCallback((orderNumber: number) => {
    setPendingReingresoOrderNumber(orderNumber);
  }, []);

  // Cancel reingreso flow
  const cancelReingreso = useCallback(() => {
    setPendingReingresoOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Reingreso cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start rechaza presupuesto flow (client rejects budget - conversational)
  const startRechazaPresup = useCallback((orderNumber: number) => {
    setPendingRechazaPresupOrderNumber(orderNumber);
  }, []);

  // Cancel rechaza presupuesto flow
  const cancelRechazaPresup = useCallback(() => {
    setPendingRechazaPresupOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Rechazo de presupuesto cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // ============= TÉCNICO ACTIONS =============

  // Start presupuesto flow (TECHNICIAN creates budget)
  const startPresupuesto = useCallback((orderNumber: number) => {
    setPendingPresupuestoOrderNumber(orderNumber);
  }, []);

  // Cancel presupuesto flow
  const cancelPresupuesto = useCallback(() => {
    setPendingPresupuestoOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Presupuesto cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start reparado flow (TECHNICIAN marks as repaired)
  const startReparado = useCallback((orderNumber: number) => {
    setPendingReparadoOrderNumber(orderNumber);
  }, []);

  // Cancel reparado flow
  const cancelReparado = useCallback(() => {
    setPendingReparadoOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Marcar reparado cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start rechazar flow (TECHNICIAN can't repair)
  const startRechazar = useCallback((orderNumber: number) => {
    setPendingRechazarOrderNumber(orderNumber);
  }, []);

  // Cancel rechazar flow
  const cancelRechazar = useCallback(() => {
    setPendingRechazarOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Rechazo técnico cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start espera repuesto flow (TECHNICIAN waiting for parts)
  const startEsperaRepuesto = useCallback((orderNumber: number) => {
    setPendingEsperaRepuestoOrderNumber(orderNumber);
  }, []);

  // Cancel espera repuesto flow
  const cancelEsperaRepuesto = useCallback(() => {
    setPendingEsperaRepuestoOrderNumber(null);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Espera de repuesto cancelado. ¿En qué más puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  // Start rep domicilio flow (TECHNICIAN home repair)
  const startRepDomicilio = useCallback((orderNumber: number) => {
    setPendingRepDomicilioOrderNumber(orderNumber);
    setRepDomicilioStep('monto');
  }, []);

  // Cancel rep domicilio flow
  const cancelRepDomicilio = useCallback(() => {
    setPendingRepDomicilioOrderNumber(null);
    setRepDomicilioStep(null);
    setRepDomicilioMonto(null);
    setPaymentMethods([]);
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      content: 'Rep. domicilio cancelado. ¿En qué más puedo ayudarte?',
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
    pendingSenaOrderNumber,
    senaStep,
    senaMonto,
    pendingInformarPresupOrderNumber,
    informarPresupStep,
    informarPresupAccion,
    pendingReingresoOrderNumber,
    pendingRechazaPresupOrderNumber,
    // Técnico action states
    pendingPresupuestoOrderNumber,
    pendingReparadoOrderNumber,
    pendingRechazarOrderNumber,
    pendingEsperaRepuestoOrderNumber,
    pendingRepDomicilioOrderNumber,
    repDomicilioStep,
    repDomicilioMonto,
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
    startRetira,
    cancelRetira,
    startSena,
    cancelSena,
    startInformarPresup,
    cancelInformarPresup,
    startReingreso,
    cancelReingreso,
    startRechazaPresup,
    cancelRechazaPresup,
    // Técnico action functions
    startPresupuesto,
    cancelPresupuesto,
    startReparado,
    cancelReparado,
    startRechazar,
    cancelRechazar,
    startEsperaRepuesto,
    cancelEsperaRepuesto,
    startRepDomicilio,
    cancelRepDomicilio,
  };
};
