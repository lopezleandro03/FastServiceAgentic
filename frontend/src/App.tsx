import React, { useState, useEffect } from 'react';
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
import { useIsMobile } from './hooks/useIsMobile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/Login/LoginPage';
import { LayoutGrid, TrendingUp, LogOut, Loader2, Users, Search, MessageCircle, Settings } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, user, logout, permissions, isLoadingPermissions } = useAuth();
  const [activeView, setActiveView] = useState<MainView>('kanban');
  const isMobile = useIsMobile();

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
    presupuestoStep,
    pendingReparadoOrderNumber,
    pendingRechazarOrderNumber,
    pendingEsperaRepuestoOrderNumber,
    pendingRepDomicilioOrderNumber,
    pendingArmadoOrderNumber,
    // Admin action states
    pendingArchivarOrderNumber,
    archivarStep,
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
    startArmado,
    // Admin action functions
    startArchivar,
  } = useChat({ 
    canAccessAccounting: permissions?.canAccessAccounting,
    userId: user?.userId
  });

  // Handle view change with permission check
  const handleViewChange = (view: MainView) => {
    // Check if user has permission to access the view
    if (view === 'accounting' && !permissions?.canAccessAccounting) {
      return; // Silently ignore if no permission
    }
    
    setActiveView(view);
    
    // Clear selected order when navigating to a different view
    if (selectedOrderDetails) {
      setSelectedOrder(null);
    }
  };

  // Reset to default view if current view is not accessible after permissions load
  useEffect(() => {
    if (!isLoadingPermissions && permissions) {
      // If on accounting but no permission, go to kanban
      if (activeView === 'accounting' && !permissions.canAccessAccounting) {
        setActiveView('kanban');
      }
    }
  }, [permissions, isLoadingPermissions, activeView]);

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
    // Edit is done directly in the detail screen, no chat message needed
  };

  const handleStartAddNota = () => {
    if (selectedOrderDetails) {
      startAddNota(selectedOrderDetails.orderNumber);
    }
  };

  const handleOrderClickFromChat = async (orderNumber: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/${orderNumber}`);
      if (response.ok) {
        const orderDetails = await response.json();
        setSelectedOrder(orderDetails);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const chatPanelContent = (
    <>
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList 
            messages={messages} 
            userName={user ? `${user.nombre} ${user.apellido}` : undefined} 
            onOrderClick={handleOrderClickFromChat}
          />
        </div>
        {isLoading && <LoadingIndicator />}
      </div>
      {/* Default suggestions - show when no order selected AND (no conversation OR conversation but no order selected) */}
      {(!selectedOrderDetails && ((!hasConversation || (hasConversation && !isCreatingOrder)) && !isLoading)) && (
        <DefaultSuggestions onSendMessage={sendMessage} onAddMessage={addMessage} onStartOrderCreation={startOrderCreation} />
      )}
      {/* Action suggestions chips above input - like real AI chips */}
      {selectedOrderDetails && !pendingNotaOrderNumber && !pendingRetiraOrderNumber && !pendingSenaOrderNumber && !pendingInformarPresupOrderNumber && !pendingReingresoOrderNumber && !pendingRechazaPresupOrderNumber && !pendingPresupuestoOrderNumber && !pendingReparadoOrderNumber && !pendingRechazarOrderNumber && !pendingEsperaRepuestoOrderNumber && !pendingRepDomicilioOrderNumber && !pendingArmadoOrderNumber && !pendingArchivarOrderNumber && (
        <ActionSuggestions
          orderNumber={selectedOrderDetails.orderNumber}
          presupuesto={selectedOrderDetails.presupuesto}
          onAddMessage={addMessage}
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
          onStartArmado={startArmado}
          onStartArchivar={startArchivar}
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
                        ? presupuestoStep === 'trabajo'
                          ? "Describe el trabajo a realizar..."
                          : "Ingresa el monto del presupuesto..."
                        : pendingReparadoOrderNumber
                          ? "Ingresa observación o 'no' para continuar..."
                          : pendingRechazarOrderNumber
                            ? "Describe el motivo del rechazo técnico..."
                            : pendingEsperaRepuestoOrderNumber
                              ? "Describe qué repuesto se necesita..."
                              : pendingRepDomicilioOrderNumber
                                ? "Ingresa el monto cobrado..."
                                : pendingArmadoOrderNumber
                                  ? "Ingresa observación o 'no' para continuar..."
                                  : pendingArchivarOrderNumber
                                    ? archivarStep === 'ubicacion'
                                      ? "Ingresa la ubicación del equipo..."
                                      : "Ingresa observación o 'no' para continuar..."
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

  // Mobile view: Show only the AI chat interface
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Mobile header with logout */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-xs font-semibold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
              Online
            </div>
            <h2 className="text-lg font-semibold text-white">FastService AI</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/80 text-sm">
              {user ? `${user.nombre}` : 'Usuario'}
            </span>
            <button
              onClick={() => {
                clearMessages();
                logout();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/20 hover:text-white transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Full-screen chat interface */}
        <div className="flex-1 min-h-0 flex flex-col bg-slate-950">
          <div className="absolute inset-0 opacity-60 pointer-events-none" aria-hidden>
            <div className="w-full h-full bg-gradient-to-b from-indigo-900/70 via-slate-950 to-slate-950" />
          </div>
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden text-white">
            {chatPanelContent}
          </div>
        </div>
      </div>
    );
  }

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
          {/* WhatsApp Integration - visible if user has accounting permission (admin) */}
          {permissions?.canAccessAccounting && (
            <button
              onClick={() => handleViewChange('whatsapp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'whatsapp'
                  ? 'bg-white text-green-600 shadow-md'
                  : 'text-white/90 hover:bg-white/20 hover:text-white'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          )}
          {/* Admin - visible if user is admin */}
          {permissions?.isAdmin && (
            <button
              onClick={() => handleViewChange('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'admin'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white/90 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              Admin
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm hidden sm:block">
            {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
          </span>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.nombre || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9${
              ['Nadia', 'Maria', 'Ana', 'Laura', 'Sofia', 'Carolina', 'Valeria', 'Lucia'].includes(user?.nombre || '') 
                ? '&top=longHair&facialHairProbability=0' 
                : ''
            }`}
            alt="User avatar"
            className="h-8 w-8 rounded-full border-2 border-white/40 bg-white/20"
          />
          <button
            onClick={() => {
              clearMessages();
              setActiveView('kanban'); // Reset view on logout
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
              onEditOrder={startOrderEdit}
              permissions={permissions}
              userId={user?.userId}
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

