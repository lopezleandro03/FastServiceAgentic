import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  ORDER_ACTIONS, 
  COMMON_ACTIONS, 
  ADMIN_ACTIONS, 
  TECNICO_ACTIONS,
  OrderActionType, 
  useOrderActions 
} from '../../hooks/useOrderActions';
import { UserPermissions } from '../../types/auth';

interface ActionSuggestionsProps {
  orderNumber: number;
  presupuesto?: number;
  onAddMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
  onStartAddNota?: () => void;
  onStartRetira?: (orderNumber: number, presupuesto?: number) => void;
  onStartSena?: (orderNumber: number) => void;
  onStartInformarPresup?: (orderNumber: number, presupuesto?: number) => void;
  onStartReingreso?: (orderNumber: number) => void;
  onStartLlamado?: (orderNumber: number) => void;
  onStartCoordEntrega?: (orderNumber: number) => void;
  onStartRechazaPresup?: (orderNumber: number) => void; // Client rejects budget
  onStartPresupuesto?: (orderNumber: number) => void;
  onStartReparado?: (orderNumber: number) => void;
  onStartRechazar?: (orderNumber: number) => void; // Technician rejects (can't repair)
  onStartEsperaRepuesto?: (orderNumber: number) => void;
  onStartRepDomicilio?: (orderNumber: number) => void;
  permissions?: UserPermissions | null;
  className?: string;
}

/**
 * AI Action Suggestions component that displays clickable action chips.
 * Actions are grouped by role: Common (all), Admin, and Técnico.
 */
const ActionSuggestions: React.FC<ActionSuggestionsProps> = ({
  orderNumber,
  presupuesto,
  onAddMessage,
  onStartAddNota,
  onStartRetira,
  onStartSena,
  onStartInformarPresup,
  onStartReingreso,
  onStartLlamado,
  onStartCoordEntrega,
  onStartRechazaPresup,
  onStartPresupuesto,
  onStartReparado,
  onStartRechazar,
  onStartEsperaRepuesto,
  onStartRepDomicilio,
  permissions,
  className,
}) => {
  const { executeAction } = useOrderActions({ orderNumber, onAddMessage });
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isExecuting, setIsExecuting] = useState<OrderActionType | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<'admin' | 'tecnico' | null>(null);

  // Determine which role groups to show
  const isManager = permissions?.isManager ?? false;
  const showAdminActions = permissions?.isAdmin ?? false;
  const showTecnicoActions = permissions?.isTecnico ?? false;

  const handleActionClick = async (actionType: OrderActionType) => {
    const action = ORDER_ACTIONS.find((a) => a.type === actionType);
    if (!action) return;

    // Handle nota/reclamo conversationally
    if (actionType === 'nota_reclamo') {
      if (onStartAddNota) {
        onAddMessage({
          role: 'user',
          content: `Quiero agregar una nota a la orden #${orderNumber}`,
        });
        onAddMessage({
          role: 'assistant',
          content: '📝 ¿Qué nota deseas agregar a esta orden? Escribe el texto de la nota y lo registraré en el sistema.',
        });
        onStartAddNota();
      }
      return;
    }

    // Handle retira conversationally (AI-assisted flow)
    if (actionType === 'retira') {
      if (onStartRetira) {
        onAddMessage({
          role: 'user',
          content: `Quiero retirar la orden #${orderNumber}`,
        });
        
        const presupuestoText = presupuesto && presupuesto > 0 
          ? `El presupuesto registrado es de **$${presupuesto.toLocaleString('es-AR')}**.\n\n¿Deseas usar este monto? Responde **"sí"** o ingresa el monto final a cobrar:`
          : `No hay presupuesto registrado para esta orden.\n\nPor favor, ingresa el monto final a cobrar:`;
        
        onAddMessage({
          role: 'assistant',
          content: `✅ **Retiro de orden #${orderNumber}**\n\n${presupuestoText}`,
        });
        onStartRetira(orderNumber, presupuesto);
      }
      return;
    }

    // Handle seña conversationally (AI-assisted flow)
    if (actionType === 'sena') {
      if (onStartSena) {
        onAddMessage({
          role: 'user',
          content: `Quiero registrar una seña para la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `💵 **Seña para orden #${orderNumber}**\n\n¿Cuánto deja el cliente como seña? Ingresa el monto:`,
        });
        onStartSena(orderNumber);
      }
      return;
    }

    // Handle informar presupuesto conversationally (AI-assisted flow)
    if (actionType === 'informar_presupuesto') {
      if (onStartInformarPresup) {
        onAddMessage({
          role: 'user',
          content: `Quiero informar el presupuesto de la orden #${orderNumber}`,
        });
        
        const presupuestoInfo = presupuesto && presupuesto > 0 
          ? `\n\nPresupuesto actual: **$${presupuesto.toLocaleString('es-AR')}**`
          : '';
        
        onAddMessage({
          role: 'assistant',
          content: `💰 **Informar presupuesto - Orden #${orderNumber}**${presupuestoInfo}\n\n¿Cuál fue la respuesta del cliente?\n\n**1.** ✅ Acepta - El cliente acepta el presupuesto\n**2.** ❌ Rechaza - El cliente rechaza el presupuesto\n**3.** ⏳ A Confirmar - Pendiente de confirmación\n\n*Ingresa el número o escribe la respuesta:*`,
        });
        onStartInformarPresup(orderNumber, presupuesto);
      }
      return;
    }

    // Handle reingreso conversationally (AI-assisted flow)
    if (actionType === 'reingreso') {
      if (onStartReingreso) {
        onAddMessage({
          role: 'user',
          content: `Quiero registrar un reingreso para la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `🔄 **Reingreso - Orden #${orderNumber}**\n\n¿Cuál es el motivo del reingreso? Por favor describe el problema o la razón:`,
        });
        onStartReingreso(orderNumber);
      }
      return;
    }

    // Handle llamado conversationally
    if (actionType === 'llamado') {
      if (onStartLlamado) {
        onAddMessage({
          role: 'user',
          content: `Quiero registrar un llamado para la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `📞 **Llamado - Orden #${orderNumber}**\n\n¿Cuál fue el resultado del llamado? Describe brevemente:`,
        });
        onStartLlamado(orderNumber);
      }
      return;
    }

    // Handle coordinar entrega conversationally
    if (actionType === 'coord_entrega') {
      if (onStartCoordEntrega) {
        onAddMessage({
          role: 'user',
          content: `Quiero coordinar la entrega de la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `📦 **Coordinar Entrega - Orden #${orderNumber}**\n\n¿Cuándo y dónde se realizará la entrega? Ingresa los detalles:`,
        });
        onStartCoordEntrega(orderNumber);
      }
      return;
    }

    // Handle rechaza presupuesto (CLIENT rejects budget) conversationally
    if (actionType === 'rechaza_presup') {
      if (onStartRechazaPresup) {
        onAddMessage({
          role: 'user',
          content: `El cliente rechaza el presupuesto de la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `🚫 **Rechazo de Presupuesto (por cliente) - Orden #${orderNumber}**\n\n¿Deseas agregar alguna observación sobre el rechazo? (Ej: "Muy caro", "Buscará otra opción")\n\nEscribe la observación o "no" para continuar sin observación:`,
        });
        onStartRechazaPresup(orderNumber);
      }
      return;
    }

    // === TÉCNICO ACTIONS ===

    // Handle presupuesto conversationally - Two step: trabajo first, then monto
    if (actionType === 'presupuesto') {
      if (onStartPresupuesto) {
        onAddMessage({
          role: 'user',
          content: `Quiero crear un presupuesto para la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `📊 **Presupuesto - Orden #${orderNumber}**\n\n🔧 ¿Cuál es el trabajo que hay que realizar?`,
        });
        onStartPresupuesto(orderNumber);
      }
      return;
    }

    // Handle reparado conversationally
    if (actionType === 'reparado') {
      if (onStartReparado) {
        onAddMessage({
          role: 'user',
          content: `Quiero marcar como reparado la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `✅ **Reparado - Orden #${orderNumber}**\n\n¿Deseas agregar alguna observación sobre la reparación? (Escribe la observación o "no" para continuar sin observación)`,
        });
        onStartReparado(orderNumber);
      }
      return;
    }

    // Handle rechazar (TECHNICIAN rejects - can't repair) conversationally
    if (actionType === 'rechazar') {
      if (onStartRechazar) {
        onAddMessage({
          role: 'user',
          content: `La orden #${orderNumber} no se puede reparar`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `❌ **No Reparable (por técnico) - Orden #${orderNumber}**\n\n¿Cuál es el motivo? (Ej: "Sin repuestos", "Daño irreparable", "No se justifica")`,
        });
        onStartRechazar(orderNumber);
      }
      return;
    }

    // Handle espera repuesto conversationally
    if (actionType === 'espera_repuesto') {
      if (onStartEsperaRepuesto) {
        onAddMessage({
          role: 'user',
          content: `Quiero marcar la orden #${orderNumber} en espera de repuesto`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `⏳ **Espera Repuesto - Orden #${orderNumber}**\n\n¿Qué repuesto se necesita? Describe el repuesto:`,
        });
        onStartEsperaRepuesto(orderNumber);
      }
      return;
    }

    // Handle reparación domicilio conversationally
    if (actionType === 'rep_domicilio') {
      if (onStartRepDomicilio) {
        onAddMessage({
          role: 'user',
          content: `Quiero registrar reparación a domicilio para la orden #${orderNumber}`,
        });
        
        onAddMessage({
          role: 'assistant',
          content: `🏠 **Reparación a Domicilio - Orden #${orderNumber}**\n\n¿Cuál es el monto cobrado por la reparación a domicilio? Ingresa el monto (ej: 25000):`,
        });
        onStartRepDomicilio(orderNumber);
      }
      return;
    }

    // If action requires input, open dialog
    if (action.requiresInput) {
      setCurrentAction(actionType);
      setInputValue('');
      setInputDialogOpen(true);
      return;
    }

    // Execute action directly
    setIsExecuting(actionType);
    try {
      await executeAction(actionType);
    } finally {
      setIsExecuting(null);
    }
  };

  const handleInputSubmit = async () => {
    if (!currentAction) return;

    setInputDialogOpen(false);
    setIsExecuting(currentAction);
    try {
      await executeAction(currentAction, inputValue);
    } finally {
      setIsExecuting(null);
      setCurrentAction(null);
      setInputValue('');
    }
  };

  const currentActionData = currentAction
    ? ORDER_ACTIONS.find((a) => a.type === currentAction)
    : null;

  // Filter out print actions from common (they will be in OrderDetailsView header)
  const commonActions = COMMON_ACTIONS.filter((a) =>
    !['print_dorso', 'print'].includes(a.type)
  );

  // Helper to render action buttons
  const renderActionButton = (action: typeof COMMON_ACTIONS[0]) => (
    <button
      key={action.type}
      onClick={() => handleActionClick(action.type)}
      disabled={isExecuting !== null}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white/90 transition-all disabled:opacity-50"
      title={action.description}
      aria-label={`${action.label}: ${action.description}`}
    >
      <span className="text-base">{action.icon}</span>
      <span>{action.label}</span>
      {isExecuting === action.type && (
        <span className="animate-spin text-sm">⏳</span>
      )}
    </button>
  );

  // Toggle group expansion
  const toggleGroup = (group: 'admin' | 'tecnico') => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  return (
    <>
      <div className={`flex-shrink-0 px-4 py-2 ${className || ''}`}>
        <div className="space-y-2">
          {/* Common Actions - Always visible */}
          <div className="flex flex-wrap gap-2">
            {commonActions.map(renderActionButton)}

            {/* For Manager: Show collapsible groups */}
            {isManager && (
              <>
                {/* Admin Group Toggle */}
                <button
                  onClick={() => toggleGroup('admin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    expandedGroup === 'admin'
                      ? 'bg-blue-500/30 border-blue-400/50 text-blue-100'
                      : 'bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white/70'
                  }`}
                  title="Acciones de administración"
                >
                  <span className="text-base">👔</span>
                  <span>Admin</span>
                  <span className="text-xs">{expandedGroup === 'admin' ? '▼' : '▶'}</span>
                </button>

                {/* Técnico Group Toggle */}
                <button
                  onClick={() => toggleGroup('tecnico')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    expandedGroup === 'tecnico'
                      ? 'bg-green-500/30 border-green-400/50 text-green-100'
                      : 'bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white/70'
                  }`}
                  title="Acciones de técnico"
                >
                  <span className="text-base">🔧</span>
                  <span>Técnico</span>
                  <span className="text-xs">{expandedGroup === 'tecnico' ? '▼' : '▶'}</span>
                </button>
              </>
            )}

            {/* For Admin (non-manager): Show admin actions directly */}
            {!isManager && showAdminActions && ADMIN_ACTIONS.map(renderActionButton)}

            {/* For Técnico (non-manager): Show técnico actions directly */}
            {!isManager && showTecnicoActions && TECNICO_ACTIONS.map(renderActionButton)}
          </div>

          {/* Manager: Admin Actions - Expandable */}
          {isManager && expandedGroup === 'admin' && (
            <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-blue-400/30">
              {ADMIN_ACTIONS.map(renderActionButton)}
            </div>
          )}

          {/* Manager: Técnico Actions - Expandable */}
          {isManager && expandedGroup === 'tecnico' && (
            <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-green-400/30">
              {TECNICO_ACTIONS.map(renderActionButton)}
            </div>
          )}
        </div>
      </div>

      {/* Input Dialog for actions that require user input */}
      <Dialog open={inputDialogOpen} onOpenChange={setInputDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentActionData?.icon} {currentActionData?.label}
            </DialogTitle>
            <DialogDescription>
              {currentActionData?.description} para orden #{orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="action-input">
                {currentActionData?.inputLabel || 'Ingrese el valor'}
              </Label>
              <Input
                id="action-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentAction === 'sena' ? 'Ej: 50000' : 'Escriba aquí...'
                }
                type={currentAction === 'sena' ? 'number' : 'text'}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInputDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInputSubmit} disabled={!inputValue.trim()}>
              Ejecutar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionSuggestions;
