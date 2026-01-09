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
import { ORDER_ACTIONS, OrderActionType, useOrderActions } from '../../hooks/useOrderActions';

interface ActionSuggestionsProps {
  orderNumber: number;
  onAddMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
  onEditOrder?: () => void;
  onStartAddNota?: () => void;
  className?: string;
}

/**
 * AI Action Suggestions component that displays clickable action chips.
 * When an action is clicked, it executes via useOrderActions hook.
 */
const ActionSuggestions: React.FC<ActionSuggestionsProps> = ({
  orderNumber,
  onAddMessage,
  onEditOrder,
  onStartAddNota,
  className,
}) => {
  const { executeAction } = useOrderActions({ orderNumber, onAddMessage });
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<OrderActionType | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isExecuting, setIsExecuting] = useState<OrderActionType | null>(null);

  const handleActionClick = async (actionType: OrderActionType) => {
    const action = ORDER_ACTIONS.find((a) => a.type === actionType);
    if (!action) return;

    // Handle edit action specially
    if (actionType === 'edit') {
      if (onEditOrder) {
        onAddMessage({
          role: 'user',
          content: `Quiero editar la orden #${orderNumber}`,
        });
        onAddMessage({
          role: 'assistant',
          content: '✏️ Puedes modificar los datos de la orden en el formulario. Haz los cambios necesarios y guarda cuando estés listo.',
        });
        onEditOrder();
      }
      return;
    }

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

  // Filter out print actions (they will be in OrderDetailsView header)
  const conversationActions = ORDER_ACTIONS.filter((a) =>
    !['print_dorso', 'print'].includes(a.type)
  );

  return (
    <>
      <div className={`flex-shrink-0 px-4 py-2 ${className || ''}`}>
        <div className="flex flex-wrap gap-2">
          {conversationActions.map((action) => (
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
          ))}
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
