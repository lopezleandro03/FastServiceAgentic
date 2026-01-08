import React from 'react';
import './App.css';
import SplitLayout from './components/Layout/SplitLayout';
import MainPanel from './components/MainPanel/MainPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import MessageList from './components/ChatPanel/MessageList';
import MessageInput from './components/ChatPanel/MessageInput';
import ActionSuggestions from './components/ChatPanel/ActionSuggestions';
import { LoadingIndicator } from './components/ChatPanel/LoadingIndicator';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, error, orders, selectedOrderDetails, sendMessage, addMessage } = useChat();

  const chatPanelContent = (
    <>
      {/* Action suggestions when viewing an order */}
      {selectedOrderDetails && (
        <ActionSuggestions
          orderNumber={selectedOrderDetails.orderNumber}
          onAddMessage={addMessage}
        />
      )}
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList messages={messages} />
        </div>
        {isLoading && <LoadingIndicator />}
      </div>
      <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
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

