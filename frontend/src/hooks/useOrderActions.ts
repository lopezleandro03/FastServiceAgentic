import { useCallback } from 'react';

export type OrderActionType =
  | 'print_dorso'
  | 'print'
  | 'nueva'
  | 'informar_presupuesto'
  | 'nota_reclamo'
  | 'reingreso'
  | 'retira'
  | 'sena';

export interface OrderAction {
  type: OrderActionType;
  label: string;
  icon: string;
  description: string;
  requiresInput?: boolean;
  inputLabel?: string;
}

export const ORDER_ACTIONS: OrderAction[] = [
  {
    type: 'print_dorso',
    label: 'Imprimir Dorso',
    icon: '🖨️',
    description: 'Imprimir etiqueta del dorso',
  },
  {
    type: 'print',
    label: 'Imprimir',
    icon: '📄',
    description: 'Imprimir formulario de orden',
  },
  {
    type: 'nueva',
    label: 'Nueva',
    icon: '➕',
    description: 'Crear nueva orden de reparación',
  },
  {
    type: 'informar_presupuesto',
    label: 'Inform. Presup.',
    icon: '💰',
    description: 'Informar presupuesto al cliente',
  },
  {
    type: 'nota_reclamo',
    label: 'Nota/Reclamo',
    icon: '📝',
    description: 'Agregar nota o registrar reclamo',
    requiresInput: true,
    inputLabel: 'Ingrese el texto de la nota o reclamo',
  },
  {
    type: 'reingreso',
    label: 'Reingreso',
    icon: '🔄',
    description: 'Registrar reingreso del equipo',
  },
  {
    type: 'retira',
    label: 'Retira',
    icon: '✅',
    description: 'Marcar orden como retirada',
  },
  {
    type: 'sena',
    label: 'Seña',
    icon: '💵',
    description: 'Registrar pago de seña',
    requiresInput: true,
    inputLabel: 'Ingrese el monto de la seña',
  },
];

export interface UseOrderActionsProps {
  orderNumber: number;
  onAddMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
}

export interface UseOrderActionsReturn {
  actions: OrderAction[];
  executeAction: (actionType: OrderActionType, inputValue?: string) => Promise<void>;
  isExecuting: boolean;
}

/**
 * Hook for managing order actions with mock execution.
 * Actions add messages to the chat showing the simulated result.
 */
export const useOrderActions = ({
  orderNumber,
  onAddMessage,
}: UseOrderActionsProps): UseOrderActionsReturn => {
  const executeAction = useCallback(
    async (actionType: OrderActionType, inputValue?: string) => {
      const action = ORDER_ACTIONS.find((a) => a.type === actionType);
      if (!action) {
        console.error(`Unknown action type: ${actionType}`);
        return;
      }

      // Mock execution with appropriate messages
      let resultMessage = '';

      switch (actionType) {
        case 'print_dorso':
          resultMessage = `🖨️ **Imprimiendo dorso...**\n\nEtiqueta del dorso para orden #${orderNumber} enviada a la impresora.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'print':
          resultMessage = `📄 **Imprimiendo orden...**\n\nFormulario de orden #${orderNumber} enviado a la impresora.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'nueva':
          resultMessage = `➕ **Creando nueva orden...**\n\nNueva orden de reparación iniciada basada en orden #${orderNumber}.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'informar_presupuesto':
          resultMessage = `💰 **Presupuesto informado**\n\nEl cliente ha sido notificado del presupuesto para orden #${orderNumber}.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'nota_reclamo':
          resultMessage = inputValue
            ? `📝 **Nota agregada**\n\nSe registró la siguiente nota para orden #${orderNumber}:\n\n> ${inputValue}\n\n*(Simulación - integración pendiente)*`
            : `📝 **Nota/Reclamo**\n\nAcción cancelada - no se proporcionó texto.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'reingreso':
          resultMessage = `🔄 **Reingreso registrado**\n\nSe registró el reingreso del equipo para orden #${orderNumber}.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'retira':
          resultMessage = `✅ **Orden retirada**\n\nLa orden #${orderNumber} ha sido marcada como retirada.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'sena':
          resultMessage = inputValue
            ? `💵 **Seña registrada**\n\nSe registró una seña de $${inputValue} para orden #${orderNumber}.\n\n*(Simulación - integración pendiente)*`
            : `💵 **Seña**\n\nAcción cancelada - no se proporcionó monto.\n\n*(Simulación - integración pendiente)*`;
          break;

        default:
          resultMessage = `✓ Acción "${action.label}" ejecutada para orden #${orderNumber}.\n\n*(Simulación - integración pendiente)*`;
      }

      // Simulate a small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Add the result message to chat
      onAddMessage({
        role: 'assistant',
        content: resultMessage,
      });
    },
    [orderNumber, onAddMessage]
  );

  return {
    actions: ORDER_ACTIONS,
    executeAction,
    isExecuting: false,
  };
};

export default useOrderActions;
