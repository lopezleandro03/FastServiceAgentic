import React, { useState } from 'react';
import { MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface SplitLayoutProps {
  mainContent: React.ReactNode;
  chatPanel: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ mainContent, chatPanel }) => {
  const [isAssistantCollapsed, setIsAssistantCollapsed] = useState(false);

  return (
    <div className="split-layout">
      <div className="split-layout__container">
        <section className={`split-layout__main flex flex-col transition-all duration-300 ${isAssistantCollapsed ? 'split-layout__main--expanded' : ''}`}>
          {mainContent}
        </section>
        <aside className={`split-layout__chat flex flex-col transition-all duration-300 ${isAssistantCollapsed ? 'split-layout__chat--collapsed' : ''}`}>
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              {!isAssistantCollapsed && <h2 className="font-semibold text-slate-800">FastService AI</h2>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAssistantCollapsed(!isAssistantCollapsed)}
              className="h-8 w-8 p-0"
              title={isAssistantCollapsed ? 'Expandir asistente' : 'Colapsar asistente'}
            >
              {isAssistantCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
          {!isAssistantCollapsed && (
            <div className="flex-1 flex flex-col min-h-0">
              {chatPanel}
            </div>
          )}
          {isAssistantCollapsed && (
            <div className="flex-1 flex items-center justify-center">
              <Button
                variant="ghost"
                onClick={() => setIsAssistantCollapsed(false)}
                className="flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-600"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs writing-mode-vertical">Asistente</span>
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default SplitLayout;
