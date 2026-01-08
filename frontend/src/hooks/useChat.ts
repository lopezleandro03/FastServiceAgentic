import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/chat';
import { OrderSummary, OrderDetails } from '../types/order';

const API_BASE_URL = 'http://localhost:5207';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  orders: OrderSummary[];
  selectedOrderDetails: OrderDetails | null;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
  clearMessages: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);

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
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setOrders([]);
    setSelectedOrderDetails(null);
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

  return {
    messages,
    isLoading,
    error,
    orders,
    selectedOrderDetails,
    sendMessage,
    addMessage,
    clearMessages,
  };
};
