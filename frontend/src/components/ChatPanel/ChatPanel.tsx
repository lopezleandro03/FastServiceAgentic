import React from 'react';

interface ChatPanelProps {
  children?: React.ReactNode;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ children }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-xl font-semibold text-white">Asistente FastService</h2>
        <p className="text-blue-100 text-sm">Preguntame sobre órdenes de reparación</p>
      </div>

      {/* Content area - will hold MessageList and MessageInput */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ChatPanel;
