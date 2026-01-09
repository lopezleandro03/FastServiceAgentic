import React, { useState } from 'react';
import { MessageSquare, ChevronLeft } from 'lucide-react';

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
          {!isAssistantCollapsed ? (
            <div className="flex-1 flex flex-col min-h-0">
              {React.isValidElement(chatPanel) 
                ? React.cloneElement(chatPanel as React.ReactElement<any>, { 
                    ...(chatPanel as React.ReactElement<any>).props,
                    onCollapse: () => setIsAssistantCollapsed(true) 
                  })
                : chatPanel
              }
            </div>
          ) : (
            <div 
              className="flex-1 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setIsAssistantCollapsed(false)}
              title="Expandir asistente"
            >
              <div className="flex flex-col items-center gap-2 text-white">
                <ChevronLeft className="w-5 h-5" />
                <MessageSquare className="w-7 h-7" />
                <span className="text-sm font-bold tracking-wide">AI</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default SplitLayout;
