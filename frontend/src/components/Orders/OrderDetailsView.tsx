import React, { useState, useEffect } from 'react';
import { OrderDetails } from '../../types/order';
import StatusBadge from './StatusBadge';
import NovedadesTable from './NovedadesTable';
import { deleteOrder, fetchOrderDetails } from '../../services/orderApi';
import { generateMessageForOrder, getTemplatesForState, getReminderTemplates, generateMessage, openWhatsApp } from '../../services/whatsappApi';
import { WhatsAppTemplate, GeneratedMessage } from '../../types/whatsapp';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ArrowLeft, Printer, Trash2, Loader2, ChevronDown, Clock, Send } from 'lucide-react';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface OrderDetailsViewProps {
  order: OrderDetails | null;
  isLoading?: boolean;
  onBack?: () => void;
  onPrint?: () => void;
  onPrintDorso?: () => void;
  onOrderDeleted?: () => void;
  onOrderRefresh?: (order: OrderDetails) => void;
}

// Compact field component for dense layout
const CompactField: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ 
  label, 
  value, 
  className = '' 
}) => (
  <div className={className}>
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm mt-0.5 truncate" title={value?.toString()}>
      {value || '-'}
    </p>
  </div>
);

// Loading skeleton for the compact view
const OrderDetailsSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-48" />
    </div>
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-4">
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  </div>
);

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, isLoading, onBack, onPrint, onPrintDorso, onOrderDeleted, onOrderRefresh }) => {
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(order);
  
  // WhatsApp template states
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<WhatsAppTemplate[]>([]);
  const [reminderTemplates, setReminderTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);

  // Update currentOrder when order prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const handleDeleteOrder = async () => {
    if (!currentOrder) return;
    
    if (!window.confirm(`¿Estás seguro de eliminar la orden #${currentOrder.orderNumber}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeletingOrder(true);
    try {
      await deleteOrder(currentOrder.orderNumber);
      if (onOrderDeleted) {
        onOrderDeleted();
      }
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la orden');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const handleNovedadDeleted = async () => {
    if (!currentOrder) return;
    try {
      const refreshedOrder = await fetchOrderDetails(currentOrder.orderNumber);
      setCurrentOrder(refreshedOrder);
      if (onOrderRefresh) {
        onOrderRefresh(refreshedOrder);
      }
    } catch (error) {
      console.error('Error refreshing order:', error);
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Format phone number for WhatsApp (remove spaces, dashes, and ensure country code)
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, remove it (Argentina local format)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If doesn't have country code, add Argentina's code (54)
    if (!cleaned.startsWith('54')) {
      cleaned = '54' + cleaned;
    }
    
    return cleaned;
  };

  // Get customer phone number for WhatsApp (prioritize celular)
  const getWhatsAppPhone = (): string | null => {
    const phone = currentOrder?.customer?.celular || currentOrder?.customer?.phone;
    if (!phone) return null;
    return formatPhoneForWhatsApp(phone);
  };

  // Load templates for the current order state
  const loadTemplates = async () => {
    if (!currentOrder) return;
    
    setIsLoadingTemplates(true);
    setWhatsAppError(null);
    
    try {
      // Get the state ID from the order (we need to map status name to ID)
      const stateId = currentOrder.repair?.estadoReparacionId;
      
      const [stateTemplates, reminders] = await Promise.all([
        stateId ? getTemplatesForState(stateId) : Promise.resolve([]),
        getReminderTemplates(),
      ]);
      
      setAvailableTemplates(stateTemplates);
      setReminderTemplates(reminders);
      
      // Auto-select default template if available
      const defaultTemplate = stateTemplates.find(t => t.esDefault) || stateTemplates[0];
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
        await loadGeneratedMessage(defaultTemplate.whatsAppTemplateId);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setWhatsAppError('Error al cargar las plantillas');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Generate message from selected template
  const loadGeneratedMessage = async (templateId: number) => {
    if (!currentOrder) return;
    
    setIsGeneratingMessage(true);
    setWhatsAppError(null);
    
    try {
      const message = await generateMessage(templateId, currentOrder.orderNumber);
      setGeneratedMessage(message);
    } catch (error) {
      console.error('Error generating message:', error);
      setWhatsAppError(error instanceof Error ? error.message : 'Error al generar el mensaje');
      setGeneratedMessage(null);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = async (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    await loadGeneratedMessage(template.whatsAppTemplateId);
  };

  // Handle WhatsApp button click - open dialog
  const handleWhatsAppClick = async () => {
    const phone = getWhatsAppPhone();
    if (!phone) {
      alert('Este cliente no tiene número de teléfono registrado');
      return;
    }
    
    setIsWhatsAppDialogOpen(true);
    await loadTemplates();
  };

  // Send the WhatsApp message
  const handleSendWhatsApp = () => {
    if (!generatedMessage) return;
    
    try {
      openWhatsApp(generatedMessage);
      setIsWhatsAppDialogOpen(false);
    } catch (error) {
      setWhatsAppError(error instanceof Error ? error.message : 'Error al abrir WhatsApp');
    }
  };

  // Quick send - use default template directly
  const handleQuickSend = async () => {
    if (!currentOrder) return;
    
    const phone = getWhatsAppPhone();
    if (!phone) {
      alert('Este cliente no tiene número de teléfono registrado');
      return;
    }
    
    try {
      const message = await generateMessageForOrder(currentOrder.orderNumber);
      openWhatsApp(message);
    } catch (error) {
      console.error('Error with quick send:', error);
      // Fall back to dialog if no template available
      handleWhatsAppClick();
    }
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No se encontró la orden</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al tablero
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Orden #{currentOrder?.orderNumber}</h2>
            <StatusBadge status={currentOrder?.status || currentOrder?.repair?.status || 'Desconocido'} />
            {currentOrder?.isDomicilio && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Domicilio
              </Badge>
            )}
            {currentOrder?.isGarantia && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Garantía
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getWhatsAppPhone() && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleWhatsAppClick}
              className="h-9 px-3 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
              title="Contactar por WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
          )}
          {onPrint && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrint}
              className="h-9 px-3"
              title="Imprimir formulario de orden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
          {onPrintDorso && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrintDorso}
              className="h-9 px-3"
              title="Imprimir etiqueta del dorso"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Dorso
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDeleteOrder}
            disabled={isDeletingOrder}
            className="h-9 px-3 bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
            title="Eliminar orden"
          >
            {isDeletingOrder ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Eliminar
          </Button>
        </div>
      </div>

      {/* Order Header Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Información de la Orden
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <CompactField label="Fecha Estado" value={formatDateTime(currentOrder?.statusDate)} />
            <CompactField label="Fecha Ingreso" value={formatDate(currentOrder?.entryDate || currentOrder?.repair?.entryDate)} />
            <CompactField label="Responsable" value={currentOrder?.responsable?.fullName} />
            <CompactField label="Técnico" value={currentOrder?.technician?.fullName} />
            <CompactField label="Presupuesto" value={formatCurrency(currentOrder?.presupuesto || currentOrder?.repair?.estimatedPrice)} />
            <CompactField label="Monto Final" value={formatCurrency(currentOrder?.montoFinal || currentOrder?.repair?.finalPrice)} />
          </div>
        </CardContent>
      </Card>

      {/* Customer Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <CompactField label="Documento" value={currentOrder?.customer?.dni} />
            <CompactField label="Nombre" value={currentOrder?.customer?.firstName || currentOrder?.customer?.fullName?.split(' ')[0]} />
            <CompactField label="Apellido" value={currentOrder?.customer?.lastName || currentOrder?.customer?.fullName?.split(' ').slice(1).join(' ')} />
            <CompactField label="Email" value={currentOrder?.customer?.email} />
            <CompactField label="Teléfono" value={currentOrder?.customer?.phone} />
            <CompactField label="Celular" value={currentOrder?.customer?.celular} />
          </div>
        </CardContent>
      </Card>

      {/* Address Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          {currentOrder?.customer?.addressDetails ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <CompactField label="Calle" value={currentOrder?.customer?.addressDetails?.calle} />
              <CompactField label="Altura" value={currentOrder?.customer?.addressDetails?.altura} />
              <CompactField label="Entre Calle 1" value={currentOrder?.customer?.addressDetails?.entreCalle1} />
              <CompactField label="Entre Calle 2" value={currentOrder?.customer?.addressDetails?.entreCalle2} />
              <CompactField label="Ciudad" value={currentOrder?.customer?.addressDetails?.ciudad} />
              <CompactField label="Código Postal" value={currentOrder?.customer?.addressDetails?.codigoPostal} />
            </div>
          ) : (
            <CompactField label="Dirección" value={currentOrder?.customer?.address} className="col-span-full" />
          )}
        </CardContent>
      </Card>

      {/* Device Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            <CompactField label="Tipo" value={currentOrder?.device?.deviceType} />
            <CompactField label="Marca" value={currentOrder?.device?.brand} />
            <CompactField label="Nro. Serie" value={currentOrder?.device?.serialNumber} />
            <CompactField label="Modelo" value={currentOrder?.device?.model} />
            <CompactField label="Ubicación" value={currentOrder?.device?.ubicacion} />
            <CompactField label="Accesorios" value={currentOrder?.device?.accesorios} />
          </div>
        </CardContent>
      </Card>

      {/* Novedades Section */}
      <Card className="border-slate-200">
        <CardHeader className="py-3 px-4 bg-slate-50/50">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Novedades ({currentOrder?.novedades?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <NovedadesTable 
            novedades={currentOrder?.novedades || []} 
            orderNumber={currentOrder?.orderNumber}
            onNovedadDeleted={handleNovedadDeleted}
          />
        </CardContent>
      </Card>

      {/* WhatsApp Template Selection Dialog */}
      <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WhatsAppIcon className="w-5 h-5 text-green-600" />
              Enviar Mensaje por WhatsApp
            </DialogTitle>
            <DialogDescription>
              Selecciona una plantilla y revisa el mensaje antes de enviar
            </DialogDescription>
          </DialogHeader>

          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span className="ml-2 text-muted-foreground">Cargando plantillas...</span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Plantilla de Mensaje</label>
                <div className="flex flex-wrap gap-2">
                  {availableTemplates.map((template) => (
                    <Button
                      key={template.whatsAppTemplateId}
                      variant={selectedTemplate?.whatsAppTemplateId === template.whatsAppTemplateId ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                      className={selectedTemplate?.whatsAppTemplateId === template.whatsAppTemplateId 
                        ? "bg-green-600 hover:bg-green-700" 
                        : ""}
                    >
                      {template.nombre}
                      {template.esDefault && <span className="ml-1 text-xs">★</span>}
                    </Button>
                  ))}
                  {reminderTemplates.length > 0 && (
                    <>
                      <div className="w-px h-6 bg-border mx-1" />
                      {reminderTemplates.map((template) => (
                        <Button
                          key={template.whatsAppTemplateId}
                          variant={selectedTemplate?.whatsAppTemplateId === template.whatsAppTemplateId ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTemplateSelect(template)}
                          className={`${selectedTemplate?.whatsAppTemplateId === template.whatsAppTemplateId 
                            ? "bg-amber-600 hover:bg-amber-700" 
                            : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {template.nombre}
                        </Button>
                      ))}
                    </>
                  )}
                </div>
                {availableTemplates.length === 0 && reminderTemplates.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hay plantillas disponibles para el estado actual. 
                    Configura plantillas en la sección "WhatsApp" del menú.
                  </p>
                )}
              </div>

              {/* Error display */}
              {whatsAppError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {whatsAppError}
                </div>
              )}

              {/* Generated Message Preview */}
              {isGeneratingMessage ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground text-sm">Generando mensaje...</span>
                </div>
              ) : generatedMessage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vista Previa del Mensaje</label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                      <span className="font-medium">Para:</span>
                      <span>{generatedMessage.customerName}</span>
                      <span className="text-green-600">({generatedMessage.phoneNumber})</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
                      <p className="text-sm whitespace-pre-wrap">{generatedMessage.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsWhatsAppDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendWhatsApp} 
              disabled={!generatedMessage || isGeneratingMessage}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailsView;
