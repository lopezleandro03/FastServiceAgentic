import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSquare, ChevronLeft, GripVertical } from 'lucide-react';

interface SplitLayoutProps {
  mainContent: React.ReactNode;
  chatPanel: React.ReactNode;
}

const MIN_CHAT_WIDTH_PERCENT = 30;
const MAX_CHAT_WIDTH_PERCENT = 50;
const DEFAULT_CHAT_WIDTH_PERCENT = 35;
const COLLAPSED_WIDTH = 60;

const SplitLayout: React.FC<SplitLayoutProps> = ({ mainContent, chatPanel }) => {
  const [isAssistantCollapsed, setIsAssistantCollapsed] = useState(false);
  const [chatWidthPercent, setChatWidthPercent] = useState(DEFAULT_CHAT_WIDTH_PERCENT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    const newChatWidthPercent = ((containerWidth - mouseX) / containerWidth) * 100;

    // If dragged below minimum, collapse
    if (newChatWidthPercent < MIN_CHAT_WIDTH_PERCENT) {
      setIsAssistantCollapsed(true);
      setIsDragging(false);
      return;
    }

    // Clamp between min and max
    const clampedWidth = Math.min(MAX_CHAT_WIDTH_PERCENT, Math.max(MIN_CHAT_WIDTH_PERCENT, newChatWidthPercent));
    setChatWidthPercent(clampedWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleExpand = useCallback(() => {
    setIsAssistantCollapsed(false);
    setChatWidthPercent(DEFAULT_CHAT_WIDTH_PERCENT);
  }, []);

  return (
    <div className="split-layout" ref={containerRef}>
      <div className="split-layout__container">
        <section 
          className="split-layout__main flex flex-col transition-all duration-300"
          style={{ 
            flex: isAssistantCollapsed 
              ? `1 1 calc(100% - ${COLLAPSED_WIDTH}px)` 
              : `1 1 ${100 - chatWidthPercent}%` 
          }}
        >
          {mainContent}
        </section>
        
        {/* Resize handle */}
        {!isAssistantCollapsed && (
          <div
            className="flex items-center justify-center w-2 cursor-col-resize hover:bg-primary/10 active:bg-primary/20 transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/70" />
          </div>
        )}
        
        <aside 
          className={`split-layout__chat flex flex-col transition-all ${isDragging ? 'duration-0' : 'duration-300'} ${isAssistantCollapsed ? 'split-layout__chat--collapsed' : ''}`}
          style={{ 
            flex: isAssistantCollapsed 
              ? `0 0 ${COLLAPSED_WIDTH}px` 
              : `0 0 ${chatWidthPercent}%`,
            maxWidth: isAssistantCollapsed ? `${COLLAPSED_WIDTH}px` : `${chatWidthPercent}%`,
            minWidth: isAssistantCollapsed ? `${COLLAPSED_WIDTH}px` : '350px'
          }}
        >
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
              onClick={handleExpand}
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
