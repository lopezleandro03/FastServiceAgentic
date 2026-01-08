import React from 'react';

interface ChatPanelProps {
  children?: React.ReactNode;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ children }) => {
  return (
    <div className="relative h-full max-h-full flex flex-col rounded-[1.5rem] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-60" aria-hidden>
        <div className="w-full h-full bg-gradient-to-b from-indigo-900/70 via-slate-950 to-slate-950" />
      </div>

      {/* Header */}
      <div className="relative flex-shrink-0 border-b border-white/10 px-6 py-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-blue-100/80 mb-2">Asistente</p>
            <h2 className="text-2xl font-semibold leading-tight">FastService AI</h2>
            <p className="text-blue-50/80 text-sm mt-1">Preguntame sobre órdenes de reparación y estados en curso.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
            Disponible
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
