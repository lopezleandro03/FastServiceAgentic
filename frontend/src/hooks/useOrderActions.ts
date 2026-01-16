import { useCallback } from 'react';

export type OrderActionType =
  | 'edit'
  | 'print_dorso'
  | 'print'
  | 'informar_presupuesto'
  | 'nota_reclamo'
  | 'reingreso'
  | 'retira'
  | 'sena'
  | 'llamado'
  | 'coord_entrega'
  | 'rechaza_presup' // Client rejects budget
  // Técnico actions
  | 'presupuesto'
  | 'reparado'
  | 'rechazar' // Technician rejects (can't repair)
  | 'espera_repuesto'
  | 'rep_domicilio';

export type ActionGroup = 'common' | 'admin' | 'tecnico';

export interface OrderAction {
  type: OrderActionType;
  label: string;
  icon: string;
  description: string;
  requiresInput?: boolean;
  inputLabel?: string;
  isSpecial?: boolean; // For actions that require custom handling (like edit)
  group: ActionGroup; // Which role group this action belongs to
}

// Common actions - available to all roles
// Note: 'edit' action moved to OrderDetailsView header button
export const COMMON_ACTIONS: OrderAction[] = [
  {
    type: 'nota_reclamo',
    label: 'Nota',
    icon: '📝',
    description: 'Agregar nota o registrar reclamo',
    isSpecial: true,
    group: 'common',
  },
  {
    type: 'print',
    label: 'Imprimir',
    icon: '📄',
    description: 'Imprimir formulario de orden',
    group: 'common',
  },
  {
    type: 'print_dorso',
    label: 'Dorso',
    icon: '🖨️',
    description: 'Imprimir etiqueta del dorso',
    group: 'common',
  },
];

// Admin actions - FastServiceAdmin, Gerente, ElectroShopAdmin
export const ADMIN_ACTIONS: OrderAction[] = [
  {
    type: 'informar_presupuesto',
    label: 'Inform. Presup.',
    icon: '💰',
    description: 'Informar presupuesto al cliente',
    isSpecial: true,
    group: 'admin',
  },
  {
    type: 'retira',
    label: 'Retira',
    icon: '✅',
    description: 'Marcar orden como retirada',
    isSpecial: true,
    group: 'admin',
  },
  {
    type: 'sena',
    label: 'Seña',
    icon: '💵',
    description: 'Registrar pago de seña',
    isSpecial: true,
    group: 'admin',
  },
  {
    type: 'reingreso',
    label: 'Reingreso',
    icon: '🔄',
    description: 'Registrar reingreso del equipo',
    isSpecial: true,
    group: 'admin',
  },
  // Hidden for now - functionality not yet implemented
  // {
  //   type: 'llamado',
  //   label: 'Llamado',
  //   icon: '📞',
  //   description: 'Registrar llamado telefónico',
  //   isSpecial: true,
  //   group: 'admin',
  // },
  // {
  //   type: 'coord_entrega',
  //   label: 'Entrega',
  //   icon: '📦',
  //   description: 'Coordinar entrega del equipo',
  //   isSpecial: true,
  //   group: 'admin',
  // },
  {
    type: 'rechaza_presup',
    label: 'Rechaza Presup.',
    icon: '🚫',
    description: 'Cliente rechaza el presupuesto',
    isSpecial: true,
    group: 'admin',
  },
];

// Técnico actions
export const TECNICO_ACTIONS: OrderAction[] = [
  {
    type: 'presupuesto',
    label: 'Presupuesto',
    icon: '📊',
    description: 'Crear presupuesto de reparación',
    isSpecial: true,
    group: 'tecnico',
  },
  {
    type: 'reparado',
    label: 'Reparado',
    icon: '✅',
    description: 'Marcar equipo como reparado',
    isSpecial: true,
    group: 'tecnico',
  },
  {
    type: 'rechazar',
    label: 'No Reparable',
    icon: '❌',
    description: 'Rechazar reparación (sin repuestos, no reparable)',
    isSpecial: true,
    group: 'tecnico',
  },
  {
    type: 'espera_repuesto',
    label: 'Esp. Repuesto',
    icon: '⏳',
    description: 'Marcar en espera de repuesto',
    isSpecial: true,
    group: 'tecnico',
  },
  {
    type: 'rep_domicilio',
    label: 'Rep. Domicilio',
    icon: '🏠',
    description: 'Reparación en domicilio',
    isSpecial: true,
    group: 'tecnico',
  },
];

// All actions combined (for backwards compatibility)
export const ORDER_ACTIONS: OrderAction[] = [
  ...COMMON_ACTIONS,
  ...ADMIN_ACTIONS,
  ...TECNICO_ACTIONS,
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

        case 'informar_presupuesto':
          // Informar Presupuesto is handled conversationally via useChat - this case shouldn't be reached
          resultMessage = `💰 **Informar Presupuesto**\n\nEsta acción se maneja de forma conversacional. Usa el botón "Inform. Presup." para iniciar el proceso.`;
          break;

        case 'nota_reclamo':
          resultMessage = inputValue
            ? `📝 **Nota agregada**\n\nSe registró la siguiente nota para orden #${orderNumber}:\n\n> ${inputValue}\n\n*(Simulación - integración pendiente)*`
            : `📝 **Nota/Reclamo**\n\nAcción cancelada - no se proporcionó texto.\n\n*(Simulación - integración pendiente)*`;
          break;

        case 'reingreso':
          // Reingreso is handled conversationally via useChat - this case shouldn't be reached
          resultMessage = `🔄 **Reingreso**\n\nEsta acción se maneja de forma conversacional. Usa el botón "Reingreso" para iniciar el proceso.`;
          break;

        case 'retira':
          // Retira is handled conversationally via useChat - this case shouldn't be reached
          resultMessage = `✅ **Retira**\n\nEsta acción se maneja de forma conversacional. Usa el botón "Retira" para iniciar el proceso.`;
          break;

        case 'sena':
          // Seña is handled conversationally via useChat - this case shouldn't be reached
          resultMessage = `💵 **Seña**\n\nEsta acción se maneja de forma conversacional. Usa el botón "Seña" para iniciar el proceso.`;
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
