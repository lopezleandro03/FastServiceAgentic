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
  className?: string;
}

/**
 * AI Action Suggestions component that displays clickable action chips.
 * When an action is clicked, it executes via useOrderActions hook.
 */
const ActionSuggestions: React.FC<ActionSuggestionsProps> = ({
  orderNumber,
  onAddMessage,
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

  // Group actions logically
  const printActions = ORDER_ACTIONS.filter((a) =>
    ['print_dorso', 'print'].includes(a.type)
  );
  const orderActions = ORDER_ACTIONS.filter((a) =>
    ['nueva', 'reingreso'].includes(a.type)
  );
  const statusActions = ORDER_ACTIONS.filter((a) =>
    ['informar_presupuesto', 'nota_reclamo', 'retira', 'sena'].includes(a.type)
  );

  const ActionGroup: React.FC<{ actions: typeof ORDER_ACTIONS; label: string }> = ({
    actions,
    label,
  }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] text-white/40 uppercase tracking-wider mr-1">
        {label}
      </span>
      {actions.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          size="sm"
          onClick={() => handleActionClick(action.type)}
          disabled={isExecuting !== null}
          className="h-7 px-2.5 text-xs bg-white/5 border-white/20 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/40 transition-colors"
          title={action.description}
          aria-label={`${action.label} - ${action.description}`}
        >
          <span className="mr-1">{action.icon}</span>
          {action.label}
          {isExecuting === action.type && (
            <span className="ml-1 animate-spin">⏳</span>
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <>
      <div className={className}>
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2">
            Acciones rápidas para Orden #{orderNumber}
          </p>
          <div className="flex flex-col gap-2">
            <ActionGroup actions={printActions} label="Imprimir" />
            <ActionGroup actions={orderActions} label="Orden" />
            <ActionGroup actions={statusActions} label="Estado" />
          </div>
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
