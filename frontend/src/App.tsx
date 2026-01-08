import React from 'react';
import SplitLayout from './components/Layout/SplitLayout';
import MainPanel from './components/MainPanel/MainPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import MessageList from './components/ChatPanel/MessageList';
import MessageInput from './components/ChatPanel/MessageInput';
import { LoadingIndicator } from './components/ChatPanel/LoadingIndicator';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, error, orders, selectedOrderDetails, sendMessage } = useChat();

  const chatPanelContent = (
    <>
      <MessageList messages={messages} />
      {isLoading && <LoadingIndicator />}
      <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
    </>
  );

  return (
    <SplitLayout
      mainContent={<MainPanel orders={orders} selectedOrderDetails={selectedOrderDetails} />}
      chatPanel={<ChatPanel>{chatPanelContent}</ChatPanel>}
    />
  );
}

export default App;

