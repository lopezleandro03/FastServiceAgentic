import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types/chat';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import StatusBadge from '../Orders/StatusBadge';

interface MessageListProps {
  messages: ChatMessage[];
  userName?: string;
  onOrderClick?: (orderNumber: number) => void;
}

interface OrderSummary {
  orderNumber: number;
  customerName: string;
  deviceInfo: string;
  model: string;
  status: string;
  entryDate: string;
}

/**
 * Parse JSON orders from message and render as table
 * Handles multiple formats:
 * 1. ```json ... ``` code blocks
 * 2. Raw JSON arrays with order data
 * 3. JSON with success/data wrapper structure
 */
const parseOrdersFromJson = (text: string): { orders: OrderSummary[]; beforeText: string; afterText: string } | null => {
  // Try to find JSON code block first
  let jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let jsonStr = jsonMatch ? jsonMatch[1] : null;
  let beforeText = '';
  let afterText = '';
  
  if (jsonMatch && jsonMatch.index !== undefined) {
    beforeText = text.substring(0, jsonMatch.index).trim();
    afterText = text.substring(jsonMatch.index + jsonMatch[0].length).trim();
  }
  
  // If no code block, look for raw JSON array or object pattern
  if (!jsonStr) {
    // Look for JSON array pattern
    const arrayMatch = text.match(/(\[[\s\S]*?\])/);
    if (arrayMatch) {
      jsonStr = arrayMatch[1];
      if (arrayMatch.index !== undefined) {
        beforeText = text.substring(0, arrayMatch.index).trim();
        afterText = text.substring(arrayMatch.index + arrayMatch[0].length).trim();
      }
    }
  }
  
  if (!jsonStr) return null;
  
  try {
    let data = JSON.parse(jsonStr);
    
    // Handle wrapped response: { success: true, data: [...] }
    if (data && typeof data === 'object' && !Array.isArray(data) && data.data) {
      data = data.data;
    }
    
    // Check if it's an array with order-like objects
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      // Check for order number in various formats
      const hasOrderNumber = firstItem.orderNumber !== undefined || 
                            firstItem.OrderNumber !== undefined ||
                            firstItem.reparacionId !== undefined ||
                            firstItem.ReparacionId !== undefined;
      
      if (hasOrderNumber) {
        const orders = data.map(item => ({
          orderNumber: item.orderNumber || item.OrderNumber || item.reparacionId || item.ReparacionId || 0,
          customerName: item.customerName || item.CustomerName || item.cliente || item.Cliente || '',
          deviceInfo: item.deviceInfo || item.DeviceInfo || item.equipo || item.Equipo || 
                     `${item.brand || item.marca || ''} ${item.deviceType || item.tipo || ''}`.trim(),
          model: item.model || item.Model || item.modelo || item.Modelo || '',
          status: item.status || item.Status || item.estado || item.Estado || '',
          entryDate: item.entryDate || item.EntryDate || item.fechaIngreso || item.FechaIngreso || '',
        }));
        return { orders, beforeText, afterText };
      }
    }
  } catch (e) {
    // Not valid JSON
  }
  return null;
};

/**
 * Render orders as a compact embedded table
 */
const OrdersTable: React.FC<{ orders: OrderSummary[]; onOrderClick?: (orderNumber: number) => void }> = ({ orders, onOrderClick }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full mt-1 mb-1">
      <div className="rounded-md border border-slate-200 bg-slate-50 overflow-x-auto">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-1 py-1 text-left font-medium w-[52px]">#</th>
              <th className="px-1 py-1 text-left font-medium">Cliente</th>
              <th className="px-1 py-1 text-left font-medium">Modelo</th>
              <th className="px-1 py-1 text-left font-medium w-[62px]">Fecha</th>
              <th className="px-1 py-1 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr 
                key={order.orderNumber} 
                className={cn(
                  "hover:bg-blue-50 transition-colors cursor-pointer",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                )}
                onClick={() => onOrderClick?.(order.orderNumber)}
              >
                <td className="px-1 py-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOrderClick?.(order.orderNumber); }}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                  >
                    #{order.orderNumber}
                  </button>
                </td>
                <td className="px-1 py-1 truncate" title={order.customerName}>
                  {order.customerName}
                </td>
                <td className="px-1 py-1 truncate" title={order.model || order.deviceInfo}>
                  {order.model || order.deviceInfo || '-'}
                </td>
                <td className="px-1 py-1 text-slate-600">
                  {formatDate(order.entryDate)}
                </td>
                <td className="px-1 py-1">
                  <StatusBadge status={order.status} className="text-[10px] px-1.5 py-0.5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-slate-500 mt-1 text-center">
        Click en una orden para ver detalles
      </div>
    </div>
  );
};

/**
 * Simple markdown parser for chat messages
 * Supports: **bold**, *italic*, order number links, JSON order tables, and preserves line breaks
 */
const parseMarkdown = (text: string, onOrderClick?: (orderNumber: number) => void): React.ReactNode => {
  // First, check if the message contains a JSON order block
  const result = parseOrdersFromJson(text);
  if (result) {
    const { orders, beforeText, afterText } = result;
    
    return (
      <React.Fragment>
        {beforeText && <>{parseTextContent(beforeText, onOrderClick)}<br /></>}
        <OrdersTable orders={orders} onOrderClick={onOrderClick} />
        {afterText && <><br />{parseTextContent(afterText, onOrderClick)}</>}
      </React.Fragment>
    );
  }

  return parseTextContent(text, onOrderClick);
};

/**
 * Parse text content with markdown formatting (bold, italic, order links)
 */
const parseTextContent = (text: string, onOrderClick?: (orderNumber: number) => void): React.ReactNode => {
  // Split by line breaks first
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Parse bold, italic, and order numbers within each line
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;
    
    while (remaining.length > 0) {
      // Check for bold (**text**)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Check for italic (*text*)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
      // Check for order numbers (#12345, orden 12345, order 12345, ticket 12345)
      const orderMatch = remaining.match(/(?:#|[Oo]rden\s*|[Oo]rder\s*|[Tt]icket\s*)(\d{4,6})\b/);
      
      // Find the earliest match
      const matches: Array<{ type: string; match: RegExpMatchArray; index: number }> = [];
      if (boldMatch && boldMatch.index !== undefined) matches.push({ type: 'bold', match: boldMatch, index: boldMatch.index });
      if (italicMatch && italicMatch.index !== undefined) matches.push({ type: 'italic', match: italicMatch, index: italicMatch.index });
      if (orderMatch && orderMatch.index !== undefined) matches.push({ type: 'order', match: orderMatch, index: orderMatch.index });
      
      matches.sort((a, b) => a.index - b.index);
      
      if (matches.length > 0) {
        const firstMatch = matches[0];
        
        // Add text before the match
        if (firstMatch.index > 0) {
          parts.push(remaining.substring(0, firstMatch.index));
        }
        
        if (firstMatch.type === 'bold') {
          parts.push(<strong key={`b-${lineIndex}-${keyIndex++}`}>{firstMatch.match[1]}</strong>);
        } else if (firstMatch.type === 'italic') {
          parts.push(<em key={`i-${lineIndex}-${keyIndex++}`}>{firstMatch.match[1]}</em>);
        } else if (firstMatch.type === 'order') {
          const orderNumber = parseInt(firstMatch.match[1], 10);
          if (onOrderClick) {
            parts.push(
              <button
                key={`o-${lineIndex}-${keyIndex++}`}
                onClick={() => onOrderClick(orderNumber)}
                className="text-primary hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 inline"
                title={`Ver orden #${orderNumber}`}
              >
                {firstMatch.match[0]}
              </button>
            );
          } else {
            parts.push(<span key={`o-${lineIndex}-${keyIndex++}`} className="font-semibold">{firstMatch.match[0]}</span>);
          }
        }
        
        remaining = remaining.substring(firstMatch.index + firstMatch.match[0].length);
      } else {
        // No more matches, add remaining text
        parts.push(remaining);
        break;
      }
    }
    
    // Return line with line break (except for last line)
    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const MessageList: React.FC<MessageListProps> = ({ messages, userName, onOrderClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
        <div className="flex justify-start">
          <div className="max-w-[95%] rounded-2xl border px-5 py-4 shadow-lg backdrop-blur border-white/10 bg-white/5 text-white/90">
            <p>Bienvenido {userName || 'usuario'}, ¡estoy acá para ayudarte!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-4 pb-6">
      {messages.map((msg) => (
        <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div
            className={cn(
              'rounded-2xl border px-5 py-4 shadow-lg transition-all duration-200 backdrop-blur',
              msg.role === 'user'
                ? 'max-w-[85%] bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-white/20 shadow-primary/30'
                : 'max-w-[95%] bg-white/95 text-slate-900 border-white/80'
            )}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
                <Badge
                  variant={msg.role === 'user' ? 'secondary' : 'outline'}
                  className={cn(
                    'border-none text-[0.6rem] uppercase tracking-[0.2em]',
                    msg.role === 'user' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {msg.role === 'user' ? (userName || 'Operador') : 'AI'}
                </Badge>
              </div>
              <span className={cn('text-[0.7rem]', msg.role === 'user' ? 'text-white/80' : 'text-slate-500')}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {parseMarkdown(msg.content, onOrderClick)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
