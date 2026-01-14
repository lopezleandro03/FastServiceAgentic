import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types/chat';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface MessageListProps {
  messages: ChatMessage[];
  userName?: string;
}

/**
 * Simple markdown parser for chat messages
 * Supports: **bold**, *italic*, and preserves line breaks
 */
const parseMarkdown = (text: string): React.ReactNode => {
  // Split by line breaks first
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Parse bold and italic within each line
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;
    
    while (remaining.length > 0) {
      // Check for bold (**text**)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Check for italic (*text*)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
      
      if (boldMatch && (!italicMatch || boldMatch.index! <= italicMatch.index!)) {
        // Add text before bold
        if (boldMatch.index! > 0) {
          parts.push(remaining.substring(0, boldMatch.index));
        }
        // Add bold text
        parts.push(<strong key={`b-${lineIndex}-${keyIndex++}`}>{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index! + boldMatch[0].length);
      } else if (italicMatch) {
        // Add text before italic
        if (italicMatch.index! > 0) {
          parts.push(remaining.substring(0, italicMatch.index));
        }
        // Add italic text
        parts.push(<em key={`i-${lineIndex}-${keyIndex++}`}>{italicMatch[1]}</em>);
        remaining = remaining.substring(italicMatch.index! + italicMatch[0].length);
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

const MessageList: React.FC<MessageListProps> = ({ messages, userName }) => {
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
          <div className="max-w-[85%] rounded-2xl border px-5 py-4 shadow-lg backdrop-blur border-white/10 bg-white/5 text-white/90">
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
              'max-w-[85%] rounded-2xl border px-5 py-4 shadow-lg transition-all duration-200 backdrop-blur',
              msg.role === 'user'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-white/20 shadow-primary/30'
                : 'bg-white/95 text-slate-900 border-white/80'
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
              {parseMarkdown(msg.content)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
