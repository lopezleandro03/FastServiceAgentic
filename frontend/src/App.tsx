import React, { useState, useRef } from 'react';
import './App.css';
import SplitLayout from './components/Layout/SplitLayout';
import MainPanel, { MainView } from './components/MainPanel/MainPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import MessageList from './components/ChatPanel/MessageList';
import MessageInput from './components/ChatPanel/MessageInput';
import ActionSuggestions from './components/ChatPanel/ActionSuggestions';
import DefaultSuggestions from './components/ChatPanel/DefaultSuggestions';
import { LoadingIndicator } from './components/ChatPanel/LoadingIndicator';
import { useChat } from './hooks/useChat';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/Login/LoginPage';
import { LayoutGrid, TrendingUp, LogOut, Loader2, Users, Search } from 'lucide-react';
import { generateAccountingInsights } from './services/accountingService';

function AppContent() {
  const { isAuthenticated, user, logout, permissions, isLoadingPermissions } = useAuth();
  const [activeView, setActiveView] = useState<MainView>('kanban');
  const hasShownAccountingInsights = useRef(false);
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
    pendingRetiraOrderNumber,
    pendingSenaOrderNumber,
    pendingInformarPresupOrderNumber,
    pendingReingresoOrderNumber,
    pendingRechazaPresupOrderNumber,
    // Técnico action states
    pendingPresupuestoOrderNumber,
    pendingReparadoOrderNumber,
    pendingRechazarOrderNumber,
    pendingEsperaRepuestoOrderNumber,
    pendingRepDomicilioOrderNumber,
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
    startRetira,
    startSena,
    startInformarPresup,
    startReingreso,
    startRechazaPresup,
    // Técnico action functions
    startPresupuesto,
    startReparado,
    startRechazar,
    startEsperaRepuesto,
    startRepDomicilio,
  } = useChat({ canAccessAccounting: permissions?.canAccessAccounting });

  // Handle view change with AI insights for accounting
  const handleViewChange = async (view: MainView) => {
    setActiveView(view);
    
    // Clear selected order when navigating to a different view
    if (selectedOrderDetails) {
      setSelectedOrder(null);
    }
    
    // Show accounting insights when entering accounting module (only once per session)
    if (view === 'accounting' && !hasShownAccountingInsights.current) {
      hasShownAccountingInsights.current = true;
      
      // Add a thinking indicator
      addMessage({
        role: 'assistant',
        content: '🔍 Analizando datos de contabilidad...',
      });
      
      try {
        const insights = await generateAccountingInsights();
        // Replace the thinking message with actual insights
        addMessage({
          role: 'assistant',
          content: insights,
        });
      } catch (error) {
        console.error('Error generating insights:', error);
      }
    }
  };

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
          <MessageList messages={messages} userName={user ? `${user.nombre} ${user.apellido}` : undefined} />
        </div>
        {isLoading && <LoadingIndicator />}
      </div>
      {/* Default suggestions when no conversation started */}
      {!hasConversation && !isLoading && (
        <DefaultSuggestions onSendMessage={sendMessage} onAddMessage={addMessage} onStartOrderCreation={startOrderCreation} />
      )}
      {/* Action suggestions chips above input - like real AI chips */}
      {selectedOrderDetails && !pendingNotaOrderNumber && !pendingRetiraOrderNumber && !pendingSenaOrderNumber && !pendingInformarPresupOrderNumber && !pendingReingresoOrderNumber && !pendingRechazaPresupOrderNumber && !pendingPresupuestoOrderNumber && !pendingReparadoOrderNumber && !pendingRechazarOrderNumber && !pendingEsperaRepuestoOrderNumber && !pendingRepDomicilioOrderNumber && (
        <ActionSuggestions
          orderNumber={selectedOrderDetails.orderNumber}
          presupuesto={selectedOrderDetails.presupuesto}
          onAddMessage={addMessage}
          onEditOrder={handleEditOrder}
          onStartAddNota={handleStartAddNota}
          onStartRetira={startRetira}
          onStartSena={startSena}
          onStartInformarPresup={startInformarPresup}
          onStartReingreso={startReingreso}
          onStartRechazaPresup={startRechazaPresup}
          onStartPresupuesto={startPresupuesto}
          onStartReparado={startReparado}
          onStartRechazar={startRechazar}
          onStartEsperaRepuesto={startEsperaRepuesto}
          onStartRepDomicilio={startRepDomicilio}
          permissions={permissions}
        />
      )}
      <MessageInput 
        onSendMessage={sendMessage} 
        disabled={isLoading} 
        placeholder={
          pendingNotaOrderNumber 
            ? "Escribe la nota aquí..." 
            : pendingRetiraOrderNumber 
              ? "Ingresa el monto o responde 'sí'..." 
              : pendingSenaOrderNumber
                ? "Ingresa el monto de la seña..."
                : pendingInformarPresupOrderNumber
                  ? "Selecciona una opción o ingresa el monto..."
                  : pendingReingresoOrderNumber
                    ? "Describe el motivo del reingreso..."
                    : pendingRechazaPresupOrderNumber
                      ? "Ingresa observación o 'no' para continuar..."
                      : pendingPresupuestoOrderNumber
                        ? "Ingresa el monto del presupuesto..."
                        : pendingReparadoOrderNumber
                          ? "Ingresa observación o 'no' para continuar..."
                          : pendingRechazarOrderNumber
                            ? "Describe el motivo del rechazo técnico..."
                            : pendingEsperaRepuestoOrderNumber
                              ? "Describe qué repuesto se necesita..."
                              : pendingRepDomicilioOrderNumber
                                ? "Ingresa el monto cobrado..."
                                : undefined
        } 
      />
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Full-width navigation header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
        <div className="flex items-center gap-2">
          {/* Kanban/Orders - always visible */}
          <button
            onClick={() => handleViewChange('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'kanban'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Trabajos
          </button>
          {/* Accounting - only visible if user has permission */}
          {isLoadingPermissions ? (
            <div className="flex items-center gap-2 px-4 py-2 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : permissions?.canAccessAccounting && (
            <button
              onClick={() => handleViewChange('accounting')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'accounting'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-white/90 hover:bg-white/20 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Contabilidad
            </button>
          )}
          {/* Clients - always visible */}
          <button
            onClick={() => handleViewChange('clients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'clients'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Clientes
          </button>
          {/* Advanced Search - always visible */}
          <button
            onClick={() => handleViewChange('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === 'search'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Search className="h-4 w-4" />
            Búsqueda
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm hidden sm:block">
            {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
          </span>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=FastService"
            alt="User avatar"
            className="h-8 w-8 rounded-full border-2 border-white/40 bg-white/20"
          />
          <button
            onClick={() => {
              clearMessages();
              logout();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
      
      {/* Split content below header */}
      <div className="flex-1 min-h-0">
        <SplitLayout
          mainContent={
            <MainPanel 
              orders={orders} 
              selectedOrderDetails={selectedOrderDetails} 
              isCreatingOrder={isCreatingOrder}
              isEditingOrder={isEditingOrder}
              editingOrderDetails={editingOrderDetails}
              activeView={activeView}
              onCancelCreate={cancelOrderCreation}
              onExitCreate={exitOrderCreation}
              onOrderSaved={handleOrderSaved}
              onOrderSelected={setSelectedOrder}
              onCancelEdit={cancelOrderEdit}
              onExitEdit={exitOrderEdit}
              onOrderUpdated={handleOrderUpdated}
              onViewChange={setActiveView}
            />
          }
          chatPanel={<ChatPanel onClearChat={clearMessages}>{chatPanelContent}</ChatPanel>}
        />
      </div>
    </div>
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

