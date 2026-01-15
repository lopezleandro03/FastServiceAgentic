// WhatsApp Template types

export interface WhatsAppTemplate {
  whatsAppTemplateId: number;
  nombre: string;
  descripcion?: string;
  estadoReparacionId?: number;
  estadoReparacionNombre?: string;
  tipoTemplate: 'estado' | 'recordatorio' | 'custom';
  mensaje: string;
  activo: boolean;
  orden: number;
  esDefault: boolean;
  creadoEn: string;
  modificadoEn: string;
}

export interface WhatsAppTemplateCreate {
  nombre: string;
  descripcion?: string;
  estadoReparacionId?: number;
  tipoTemplate?: 'estado' | 'recordatorio' | 'custom';
  mensaje: string;
  activo?: boolean;
  orden?: number;
  esDefault?: boolean;
}

export interface WhatsAppTemplateUpdate {
  nombre?: string;
  descripcion?: string;
  estadoReparacionId?: number;
  tipoTemplate?: 'estado' | 'recordatorio' | 'custom';
  mensaje?: string;
  activo?: boolean;
  orden?: number;
  esDefault?: boolean;
}

export interface GeneratedMessage {
  templateId: number;
  templateName: string;
  message: string;
  phoneNumber?: string;
  whatsAppUrl?: string;
  orderNumber: number;
  customerName: string;
}

export interface PlaceholderInfo {
  placeholder: string;
  description: string;
}

// Template type labels for display
export const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  estado: 'Estado',
  recordatorio: 'Recordatorio',
  custom: 'Personalizado',
};
