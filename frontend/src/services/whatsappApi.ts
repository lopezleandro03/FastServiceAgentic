// WhatsApp API client for template management and message generation
import { 
  WhatsAppTemplate, 
  WhatsAppTemplateCreate, 
  WhatsAppTemplateUpdate, 
  GeneratedMessage,
  PlaceholderInfo 
} from '../types/whatsapp';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Get all WhatsApp templates (admin view - includes inactive)
 */
export async function getAllTemplates(): Promise<WhatsAppTemplate[]> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(templateId: number): Promise<WhatsAppTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/${templateId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Template no encontrado');
    }
    throw new Error(`Failed to fetch template: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get templates for a specific repair state
 */
export async function getTemplatesForState(estadoReparacionId: number): Promise<WhatsAppTemplate[]> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/state/${estadoReparacionId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch templates for state: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get reminder templates
 */
export async function getReminderTemplates(): Promise<WhatsAppTemplate[]> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/reminders`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reminder templates: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create a new WhatsApp template
 */
export async function createTemplate(template: WhatsAppTemplateCreate): Promise<WhatsAppTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create template: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Update an existing WhatsApp template
 */
export async function updateTemplate(templateId: number, template: WhatsAppTemplateUpdate): Promise<WhatsAppTemplate> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/${templateId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Template no encontrado');
    }
    throw new Error(`Failed to update template: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Delete a WhatsApp template
 */
export async function deleteTemplate(templateId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/${templateId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Template no encontrado');
    }
    throw new Error(`Failed to delete template: ${response.statusText}`);
  }
}

/**
 * Generate a message from a specific template for an order
 */
export async function generateMessage(templateId: number, orderNumber: number): Promise<GeneratedMessage> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/templates/${templateId}/generate/${orderNumber}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      const data = await response.json();
      throw new Error(data.message || 'No encontrado');
    }
    throw new Error(`Failed to generate message: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Generate a message for an order using its current state's default template
 */
export async function generateMessageForOrder(orderNumber: number): Promise<GeneratedMessage> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/generate/${orderNumber}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      const data = await response.json();
      throw new Error(data.message || 'No encontrado');
    }
    throw new Error(`Failed to generate message: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get available placeholders for templates
 */
export async function getPlaceholders(): Promise<PlaceholderInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/whatsapp/placeholders`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch placeholders: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Open WhatsApp with a pre-filled message
 */
export function openWhatsApp(generatedMessage: GeneratedMessage): void {
  if (generatedMessage.whatsAppUrl) {
    window.open(generatedMessage.whatsAppUrl, '_blank');
  } else if (generatedMessage.phoneNumber) {
    // Fallback: construct URL manually
    const encodedMessage = encodeURIComponent(generatedMessage.message);
    const url = `https://wa.me/${generatedMessage.phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  } else {
    throw new Error('No hay número de teléfono disponible para este cliente');
  }
}
