import React from 'react';
import './App.css';
import SplitLayout from './components/Layout/SplitLayout';
import MainPanel from './components/MainPanel/MainPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import MessageList from './components/ChatPanel/MessageList';
import MessageInput from './components/ChatPanel/MessageInput';
import ActionSuggestions from './components/ChatPanel/ActionSuggestions';
import DefaultSuggestions from './components/ChatPanel/DefaultSuggestions';
import { LoadingIndicator } from './components/ChatPanel/LoadingIndicator';
import { useChat } from './hooks/useChat';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/Login/LoginPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { 
    messages, 
    isLoading, 
    error, 
    orders, 
    selectedOrderDetails, 
    isCreatingOrder,
    isEditingOrder,
    editingOrderDetails,
    pendingNotaOrderNumber,
    sendMessage, 
    addMessage, 
    clearMessages,
    startOrderCreation,
    cancelOrderCreation,
    exitOrderCreation,
    setSelectedOrder,
    startOrderEdit,
    cancelOrderEdit,
    exitOrderEdit,
    startAddNota,
  } = useChat();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const hasConversation = messages.length > 0;

  const handleOrderSaved = async () => {
    // Add success message
    addMessage({
      role: 'assistant',
      content: '✅ ¡Orden creada exitosamente! ¿Hay algo más en lo que pueda ayudarte?',
    });
  };

  const handleOrderUpdated = async () => {
    // Add success message
    addMessage({
      role: 'assistant',
      content: '✅ ¡Orden actualizada exitosamente! ¿Hay algo más en lo que pueda ayudarte?',
    });
  };

  const handleEditOrder = () => {
    if (selectedOrderDetails) {
      startOrderEdit(selectedOrderDetails);
    }
  };

  const handleStartAddNota = () => {
    if (selectedOrderDetails) {
      startAddNota(selectedOrderDetails.orderNumber);
    }
  };

  const chatPanelContent = (
    <>
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList messages={messages} />
        </div>
        {isLoading && <LoadingIndicator />}
      </div>
      {/* Default suggestions when no conversation started */}
      {!hasConversation && !isLoading && (
        <DefaultSuggestions onSendMessage={sendMessage} onAddMessage={addMessage} onStartOrderCreation={startOrderCreation} />
      )}
      {/* Action suggestions chips above input - like real AI chips */}
      {selectedOrderDetails && !pendingNotaOrderNumber && (
        <ActionSuggestions
          orderNumber={selectedOrderDetails.orderNumber}
          onAddMessage={addMessage}
          onEditOrder={handleEditOrder}
          onStartAddNota={handleStartAddNota}
        />
      )}
      <MessageInput onSendMessage={sendMessage} disabled={isLoading} placeholder={pendingNotaOrderNumber ? "Escribe la nota aquí..." : undefined} />
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
    </>
  );

  return (
    <SplitLayout
      mainContent={
        <MainPanel 
          orders={orders} 
          selectedOrderDetails={selectedOrderDetails} 
          isCreatingOrder={isCreatingOrder}
          isEditingOrder={isEditingOrder}
          editingOrderDetails={editingOrderDetails}
          onCancelCreate={cancelOrderCreation}
          onExitCreate={exitOrderCreation}
          onOrderSaved={handleOrderSaved}
          onOrderSelected={setSelectedOrder}
          onCancelEdit={cancelOrderEdit}
          onExitEdit={exitOrderEdit}
          onOrderUpdated={handleOrderUpdated}
        />
      }
      chatPanel={<ChatPanel onClearChat={clearMessages}>{chatPanelContent}</ChatPanel>}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

