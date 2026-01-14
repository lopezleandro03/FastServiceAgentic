import React from 'react';
import { Plus, Search } from 'lucide-react';

interface DefaultSuggestionsProps {
  onSendMessage: (message: string) => void;
  onAddMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
  onStartOrderCreation: () => void;
}

/**
 * Default suggestion chips shown when no conversation has started yet.
 */
const DefaultSuggestions: React.FC<DefaultSuggestionsProps> = ({ onSendMessage, onAddMessage, onStartOrderCreation }) => {
  
  const handleSearchClick = () => {
    // Add user message immediately
    onAddMessage({ role: 'user', content: 'Quiero buscar una orden' });
    
    // Add assistant response after a brief delay to simulate thinking
    setTimeout(() => {
      onAddMessage({ 
        role: 'assistant', 
        content: `🔍 **Métodos de búsqueda disponibles:**

Puedes buscar órdenes de las siguientes formas:

• **⚡ Búsqueda rápida** - Usa **#128001** para buscar directo sin IA
• **Por número de orden** - Ej: "Buscar orden 128001"
• **Por nombre del cliente** - Ej: "Órdenes de Juan Pérez"
• **Por DNI del cliente** - Ej: "Buscar DNI 12345678"
• **Por teléfono** - Ej: "Buscar teléfono 1155667788"
• **Por estado** - Ej: "Órdenes en reparación" o "Órdenes pendientes"
• **Por fecha** - Ej: "Órdenes de hoy" o "Órdenes de esta semana"

Escribe tu búsqueda en el campo de texto de abajo.`
      });
    }, 1000);
  };

  return (
    <div className="flex-shrink-0 px-4 py-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onStartOrderCreation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white/90 transition-all"
          title="Nueva orden"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva orden</span>
        </button>
        <button
          onClick={handleSearchClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white/90 transition-all"
          title="Buscar orden (usa #número para búsqueda rápida)"
        >
          <Search className="w-4 h-4" />
          <span>Buscar orden</span>
        </button>
      </div>
    </div>
  );
};

export default DefaultSuggestions;
