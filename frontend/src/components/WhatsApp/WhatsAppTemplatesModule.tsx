import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  MessageSquare, 
  Info,
  Star,
  StarOff,
  Loader2,
  Copy
} from 'lucide-react';
import { 
  getAllTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getPlaceholders 
} from '../../services/whatsappApi';
import { fetchStatuses } from '../../services/orderApi';
import { WhatsAppTemplate, WhatsAppTemplateCreate, WhatsAppTemplateUpdate, PlaceholderInfo, TEMPLATE_TYPE_LABELS } from '../../types/whatsapp';
import { OrderStatus } from '../../types/order';

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

interface TemplateFormData {
  nombre: string;
  descripcion: string;
  estadoReparacionId: number | null;
  tipoTemplate: 'estado' | 'recordatorio' | 'custom';
  mensaje: string;
  activo: boolean;
  orden: number;
  esDefault: boolean;
}

const emptyFormData: TemplateFormData = {
  nombre: '',
  descripcion: '',
  estadoReparacionId: null,
  tipoTemplate: 'estado',
  mensaje: '',
  activo: true,
  orden: 0,
  esDefault: false,
};

const WhatsAppTemplatesModule: React.FC = () => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [placeholders, setPlaceholders] = useState<PlaceholderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPlaceholdersOpen, setIsPlaceholdersOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<WhatsAppTemplate | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<TemplateFormData>(emptyFormData);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [templatesData, statusesData, placeholdersData] = await Promise.all([
        getAllTemplates(),
        fetchStatuses(),
        getPlaceholders(),
      ]);
      setTemplates(templatesData);
      setStatuses(statusesData);
      setPlaceholders(placeholdersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData(emptyFormData);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setFormData({
      nombre: template.nombre,
      descripcion: template.descripcion || '',
      estadoReparacionId: template.estadoReparacionId || null,
      tipoTemplate: template.tipoTemplate,
      mensaje: template.mensaje,
      activo: template.activo,
      orden: template.orden,
      esDefault: template.esDefault,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (template: WhatsAppTemplate) => {
    setDeletingTemplate(template);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.mensaje.trim()) {
      setError('Nombre y Mensaje son campos requeridos');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingTemplate) {
        // Update existing
        const updateData: WhatsAppTemplateUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          estadoReparacionId: formData.estadoReparacionId || undefined,
          tipoTemplate: formData.tipoTemplate,
          mensaje: formData.mensaje,
          activo: formData.activo,
          orden: formData.orden,
          esDefault: formData.esDefault,
        };
        await updateTemplate(editingTemplate.whatsAppTemplateId, updateData);
      } else {
        // Create new
        const createData: WhatsAppTemplateCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          estadoReparacionId: formData.estadoReparacionId || undefined,
          tipoTemplate: formData.tipoTemplate,
          mensaje: formData.mensaje,
          activo: formData.activo,
          orden: formData.orden,
          esDefault: formData.esDefault,
        };
        await createTemplate(createData);
      }
      
      setIsFormOpen(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;

    setIsSaving(true);
    setError(null);

    try {
      await deleteTemplate(deletingTemplate.whatsAppTemplateId);
      setIsDeleteOpen(false);
      setDeletingTemplate(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsSaving(false);
    }
  };

  const copyPlaceholder = (placeholder: string) => {
    navigator.clipboard.writeText(placeholder);
  };

  const getStatusName = (estadoReparacionId: number | undefined): string => {
    if (!estadoReparacionId) return '-';
    const status = statuses.find(s => s.statusId === estadoReparacionId);
    return status?.name || `ID: ${estadoReparacionId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WhatsAppIcon className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integración WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Administra las plantillas de mensajes para comunicarte con los clientes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPlaceholdersOpen(true)}>
            <Info className="w-4 h-4 mr-2" />
            Variables Disponibles
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Templates table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Plantillas de Mensajes ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay plantillas configuradas. Crea tu primera plantilla para comenzar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado Asociado</TableHead>
                  <TableHead className="max-w-md">Vista Previa</TableHead>
                  <TableHead className="w-24 text-center">Activo</TableHead>
                  <TableHead className="w-24 text-center">Default</TableHead>
                  <TableHead className="w-28">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.whatsAppTemplateId}>
                    <TableCell className="font-mono text-sm">{template.orden}</TableCell>
                    <TableCell className="font-medium">{template.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        template.tipoTemplate === 'estado' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : template.tipoTemplate === 'recordatorio'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }>
                        {TEMPLATE_TYPE_LABELS[template.tipoTemplate] || template.tipoTemplate}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.estadoReparacionNombre || getStatusName(template.estadoReparacionId)}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground truncate" title={template.mensaje}>
                        {template.mensaje.substring(0, 80)}{template.mensaje.length > 80 ? '...' : ''}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      {template.activo ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {template.esDefault ? (
                        <Star className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : (
                        <StarOff className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(template)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDelete(template)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Modifica los campos de la plantilla de WhatsApp'
                : 'Crea una nueva plantilla de mensaje para WhatsApp'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Presupuestado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoTemplate">Tipo</Label>
                <select
                  id="tipoTemplate"
                  value={formData.tipoTemplate}
                  onChange={(e) => setFormData({ ...formData, tipoTemplate: e.target.value as any })}
                  className="w-full h-10 px-3 border rounded-md bg-background"
                >
                  <option value="estado">Estado</option>
                  <option value="recordatorio">Recordatorio</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional del uso de esta plantilla"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estadoReparacionId">Estado Asociado</Label>
                <select
                  id="estadoReparacionId"
                  value={formData.estadoReparacionId || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    estadoReparacionId: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full h-10 px-3 border rounded-md bg-background"
                >
                  <option value="">Sin estado asociado</option>
                  {statuses.map((status) => (
                    <option key={status.statusId} value={status.statusId}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orden">Orden de Prioridad</Label>
                <Input
                  id="orden"
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mensaje">Mensaje *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsPlaceholdersOpen(true)}
                >
                  <Info className="w-4 h-4 mr-1" />
                  Ver Variables
                </Button>
              </div>
              <Textarea
                id="mensaje"
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                placeholder="Escribe el mensaje usando variables como {{cliente}}, {{ticket}}, etc."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Usa variables como {"{{cliente}}"}, {"{{ticket}}"}, {"{{presupuesto}}"} para insertar datos dinámicos
              </p>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.esDefault}
                  onChange={(e) => setFormData({ ...formData, esDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Es Default para este estado</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Plantilla</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la plantilla "{deletingTemplate?.nombre}"? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Placeholders Info Dialog */}
      <Dialog open={isPlaceholdersOpen} onOpenChange={setIsPlaceholdersOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Variables Disponibles</DialogTitle>
            <DialogDescription>
              Usa estas variables en tus plantillas. Se reemplazarán automáticamente con los datos de la orden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholders.map((p) => (
                  <TableRow key={p.placeholder}>
                    <TableCell className="font-mono text-sm text-blue-600">
                      {p.placeholder}
                    </TableCell>
                    <TableCell className="text-sm">{p.description}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyPlaceholder(p.placeholder)}
                        title="Copiar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPlaceholdersOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppTemplatesModule;
