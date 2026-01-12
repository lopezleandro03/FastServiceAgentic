import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false, placeholder }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-white/10 bg-slate-950/80 p-4">
      <div className="rounded-2xl bg-white/95 shadow-2xl shadow-slate-900/10 p-3">
        <div className="flex gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder || "Escribí tu consulta... (Tip: #128001 para búsqueda rápida)"}
            disabled={disabled}
            className="flex-1 resize-none border-none bg-transparent text-slate-900 placeholder-slate-400 focus-visible:ring-0"
            rows={2}
          />
          <Button
            type="submit"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="self-end gap-2"
          >
            Enviar
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14m0 0l-6-6m6 6l-6 6"
              />
            </svg>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
