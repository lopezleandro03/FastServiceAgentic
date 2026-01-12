import React from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatPanelProps {
  children?: React.ReactNode;
  onCollapse?: () => void;
  onClearChat?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ children, onCollapse, onClearChat }) => {

  return (
    <div className="relative h-full max-h-full flex flex-col overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-60" aria-hidden>
        <div className="w-full h-full bg-gradient-to-b from-indigo-900/70 via-slate-950 to-slate-950" />
      </div>

      {/* Header with FastService AI branding */}
      <div className="relative flex-shrink-0 border-b border-white/10 px-4 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-xs font-semibold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
              Online
            </div>
            <h2 className="text-lg font-semibold leading-tight">FastService AI</h2>
          </div>
          <div className="flex items-center gap-1">
            {onClearChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearChat}
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20"
                title="Limpiar chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCollapse}
                className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20"
                title="Colapsar asistente"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ChatPanel;
