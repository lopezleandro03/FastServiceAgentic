import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Power, 
  PowerOff, 
  Search, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
  Tag,
  X
} from 'lucide-react';
import {
  AdminItem,
  getDeviceTypes,
  createDeviceType,
  updateDeviceType,
  toggleDeviceType,
  deleteDeviceType,
  getBrands,
  createBrand,
  updateBrand,
  toggleBrand,
  deleteBrand,
} from '../../services/adminApi';
import { useAuth } from '../../contexts/AuthContext';

type TabType = 'tipos' | 'marcas';

interface EditingItem {
  id: number | null;
  nombre: string;
  descripcion: string;
}

export const AdminModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tipos');
  const [deviceTypes, setDeviceTypes] = useState<AdminItem[]>([]);
  const [brands, setBrands] = useState<AdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; nombre: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [typesData, brandsData] = await Promise.all([
        getDeviceTypes(),
        getBrands(),
      ]);
      setDeviceTypes(typesData);
      setBrands(brandsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const currentItems = activeTab === 'tipos' ? deviceTypes : brands;
  const filteredItems = currentItems.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesActive = showInactive || item.activo;
    return matchesSearch && matchesActive;
  });

  const handleAdd = () => {
    clearMessages();
    setEditingItem({ id: null, nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: AdminItem) => {
    clearMessages();
    setEditingItem({ id: item.id, nombre: item.nombre, descripcion: item.descripcion || '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      if (editingItem.id === null) {
        // Create new
        if (activeTab === 'tipos') {
          const newItem = await createDeviceType({
            nombre: editingItem.nombre.trim(),
            descripcion: editingItem.descripcion.trim() || undefined,
            userId: user?.userId || 0,
          });
          setDeviceTypes(prev => [...prev, newItem].sort((a, b) => a.nombre.localeCompare(b.nombre)));
          showSuccessMessage('Tipo de dispositivo creado correctamente');
        } else {
          const newItem = await createBrand({
            nombre: editingItem.nombre.trim(),
            descripcion: editingItem.descripcion.trim() || undefined,
            userId: user?.userId || 0,
          });
          setBrands(prev => [...prev, newItem].sort((a, b) => a.nombre.localeCompare(b.nombre)));
          showSuccessMessage('Marca creada correctamente');
        }
      } else {
        // Update existing
        if (activeTab === 'tipos') {
          const updated = await updateDeviceType(editingItem.id, {
            nombre: editingItem.nombre.trim(),
            descripcion: editingItem.descripcion.trim() || undefined,
            userId: user?.userId || 0,
          });
          setDeviceTypes(prev => prev.map(item => item.id === updated.id ? updated : item).sort((a, b) => a.nombre.localeCompare(b.nombre)));
          showSuccessMessage('Tipo de dispositivo actualizado correctamente');
        } else {
          const updated = await updateBrand(editingItem.id, {
            nombre: editingItem.nombre.trim(),
            descripcion: editingItem.descripcion.trim() || undefined,
            userId: user?.userId || 0,
          });
          setBrands(prev => prev.map(item => item.id === updated.id ? updated : item).sort((a, b) => a.nombre.localeCompare(b.nombre)));
          showSuccessMessage('Marca actualizada correctamente');
        }
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (item: AdminItem) => {
    clearMessages();
    try {
      if (activeTab === 'tipos') {
        const updated = await toggleDeviceType(item.id, user?.userId || 0);
        setDeviceTypes(prev => prev.map(i => i.id === updated.id ? updated : i));
        showSuccessMessage(`Tipo ${updated.activo ? 'activado' : 'desactivado'} correctamente`);
      } else {
        const updated = await toggleBrand(item.id, user?.userId || 0);
        setBrands(prev => prev.map(i => i.id === updated.id ? updated : i));
        showSuccessMessage(`Marca ${updated.activo ? 'activada' : 'desactivada'} correctamente`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const handleDelete = async (item: AdminItem) => {
    setDeleteConfirm({ id: item.id, nombre: item.nombre });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    clearMessages();
    try {
      if (activeTab === 'tipos') {
        await deleteDeviceType(deleteConfirm.id);
        setDeviceTypes(prev => prev.filter(i => i.id !== deleteConfirm.id));
        showSuccessMessage('Tipo de dispositivo eliminado correctamente');
      } else {
        await deleteBrand(deleteConfirm.id);
        setBrands(prev => prev.filter(i => i.id !== deleteConfirm.id));
        showSuccessMessage('Marca eliminada correctamente');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const activeCount = currentItems.filter(i => i.activo).length;
  const inactiveCount = currentItems.filter(i => !i.activo).length;

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administración</h1>
          <p className="text-sm text-slate-500">Gestión de Tipos de Dispositivo y Marcas</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={clearMessages} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('tipos'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tipos'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Tipos de Dispositivo
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
            {deviceTypes.filter(t => t.activo).length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('marcas'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'marcas'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Tag className="h-4 w-4" />
          Marcas
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
            {brands.filter(b => b.activo).length}
          </span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'tipos' ? 'tipos' : 'marcas'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Mostrar inactivos ({inactiveCount})
        </label>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar {activeTab === 'tipos' ? 'Tipo' : 'Marca'}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {activeCount} activos
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          {inactiveCount} inactivos
        </span>
        <span>|</span>
        <span>{filteredItems.length} mostrando</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-slate-200 rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{searchTerm ? 'No se encontraron resultados' : 'No hay datos'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50 transition-colors ${!item.activo ? 'bg-slate-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-medium ${item.activo ? 'text-slate-900' : 'text-slate-400'}`}>
                      {item.nombre}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${item.activo ? 'text-slate-600' : 'text-slate-400'}`}>
                      {item.descripcion || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                      item.activo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.activo ? (
                        <>
                          <Power className="h-3 w-3" />
                          Activo
                        </>
                      ) : (
                        <>
                          <PowerOff className="h-3 w-3" />
                          Inactivo
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.activo 
                            ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50' 
                            : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={item.activo ? 'Desactivar' : 'Activar'}
                      >
                        {item.activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingItem.id === null 
                  ? `Agregar ${activeTab === 'tipos' ? 'Tipo de Dispositivo' : 'Marca'}` 
                  : `Editar ${activeTab === 'tipos' ? 'Tipo de Dispositivo' : 'Marca'}`}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.nombre}
                  onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={activeTab === 'tipos' ? 'Ej: Notebook, Celular, Tablet...' : 'Ej: Samsung, Apple, LG...'}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editingItem.descripcion}
                  onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Descripción opcional..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !editingItem.nombre.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Confirmar eliminación</h2>
              <p className="text-sm text-slate-600">
                ¿Estás seguro de que deseas eliminar <strong>"{deleteConfirm.nombre}"</strong>?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Esta acción no se puede deshacer. Si el elemento está siendo usado en órdenes, no podrá ser eliminado.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
