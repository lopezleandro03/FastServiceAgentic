import React from 'react';

interface SplitLayoutProps {
  mainContent: React.ReactNode;
  chatPanel: React.ReactNode;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({ mainContent, chatPanel }) => {
  return (
    <div className="split-layout">
      <div className="split-layout__container">
        <section className="split-layout__main flex flex-col">
          {mainContent}
        </section>
        <aside className="split-layout__chat flex flex-col">
          {chatPanel}
        </aside>
      </div>
    </div>
  );
};

export default SplitLayout;
