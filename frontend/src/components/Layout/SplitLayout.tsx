import React from 'react';

interface SplitLayoutProps {
  mainContent: React.ReactNode;
  chatPanel: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ mainContent, chatPanel }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Panel - 70% */}
      <div className="w-full lg:w-[70%] flex-shrink-0 overflow-auto border-r border-gray-300">
        {mainContent}
      </div>

      {/* Chat Panel - 30% */}
      <div className="hidden lg:flex lg:w-[30%] flex-shrink-0 overflow-auto">
        {chatPanel}
      </div>

      {/* Mobile: Chat panel overlay (could be toggled) */}
      <div className="lg:hidden fixed inset-0 bg-white z-50 hidden" id="mobile-chat">
        {chatPanel}
      </div>
    </div>
  );
};

export default SplitLayout;
