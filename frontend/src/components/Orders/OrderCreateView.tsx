import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Save, X, Search, Ban, Pencil, Loader2, CheckCircle } from 'lucide-react';
import { OrderDetails } from '../../types/order';
import { getClientByDni } from '../../services/clientsApi';

const API_BASE_URL = 'http://localhost:5207';
const GOOGLE_MAPS_API_KEY = 'AIzaSyAF44JdvJ96J5WyhIwxFRc646TTjhQ2dIY';

interface CustomerData {
  clienteId: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  celular: string;
  direccion: string;
  calle: string;
  altura: string;
  entreCalle1: string;
  entreCalle2: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  pais: string;
  latitud: string;
  longitud: string;
}

interface DeviceData {
  tipoId: number;
  marcaId: number;
  modelo: string;
  nroSerie: string;
  serBus: string;
  ubicacion: string;
  accesorios: string;
}

interface ComercioData {
  comercioId: number;
  telefono: string;
}

export interface OrderFormData {
  customer: CustomerData;
  device: DeviceData;
  comercio: ComercioData;
  garantia: boolean;
  domicilio: boolean;
  presupuesto: string;
  montoFinal: string;
  responsableId: number;
  tecnicoId: number;
  fechaCompra: string;
}

interface DropdownOption {
  id: number;
  name: string;
}

interface ComercioOption {
  id: number;
  code: string;
  telefono?: string;
}

interface OrderCreateViewProps {
  onCancel: () => void;
  onSave: (orderData: OrderFormData) => Promise<void>;
  editMode?: boolean;
  existingOrder?: OrderDetails | null;
}

const initialFormData: OrderFormData = {
  customer: {
    clienteId: 0,
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    celular: '',
    direccion: '',
    calle: '',
    altura: '',
    entreCalle1: '',
    entreCalle2: '',
    ciudad: '',
    codigoPostal: '',
    provincia: '',
    pais: '',
    latitud: '',
    longitud: '',
  },
  device: {
    tipoId: 0,
    marcaId: 0,
    modelo: '',
    nroSerie: '',
    serBus: '',
    ubicacion: '',
    accesorios: '',
  },
  comercio: {
    comercioId: 0,
    telefono: '',
  },
  garantia: false,
  domicilio: false,
  presupuesto: '',
  montoFinal: '',
  responsableId: 0,
  tecnicoId: 0,
  fechaCompra: '',
};

const EditableField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  actionButton?: React.ReactNode;
}> = ({ label, value, onChange, type = 'text', required, placeholder, disabled, id, actionButton }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className={actionButton ? "flex gap-1" : ""}>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="h-8 text-sm flex-1"
        required={required}
        disabled={disabled}
        autoComplete="off"
      />
      {actionButton}
    </div>
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: DropdownOption[];
  required?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, options, required, placeholder }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      required={required}
    >
      <option value={0}>{placeholder || 'Seleccionar...'}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  </div>
);

const CheckboxField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <Label className="text-sm font-medium">{label}</Label>
  </div>
);

// Declare google as a global for TypeScript
declare global {
  interface Window {
    google: any;
    initGoogleMapsAutocomplete: () => void;
  }
}

const OrderCreateView: React.FC<OrderCreateViewProps> = ({ onCancel, onSave, editMode = false, existingOrder }) => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // DNI autocomplete state
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [dniFound, setDniFound] = useState(false);
  const dniSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dropdown options
  const [tipoOptions, setTipoOptions] = useState<DropdownOption[]>([]);
  const [marcaOptions, setMarcaOptions] = useState<DropdownOption[]>([]);
  const [tecnicoOptions, setTecnicoOptions] = useState<DropdownOption[]>([]);
  const [responsableOptions, setResponsableOptions] = useState<DropdownOption[]>([]);
  const [comercioOptions, setComercioOptions] = useState<ComercioOption[]>([]);

  const autocompleteRef = useRef<any>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data from existing order when in edit mode
  useEffect(() => {
    if (editMode && existingOrder) {
      setFormData({
        customer: {
          clienteId: existingOrder.customer.customerId || 0,
          firstName: existingOrder.customer.firstName || '',
          lastName: existingOrder.customer.lastName || '',
          dni: existingOrder.customer.dni || '',
          email: existingOrder.customer.email || '',
          phone: existingOrder.customer.phone || '',
          celular: existingOrder.customer.celular || '',
          direccion: existingOrder.customer.address || '',
          calle: existingOrder.customer.addressDetails?.calle || '',
          altura: existingOrder.customer.addressDetails?.altura || '',
          entreCalle1: existingOrder.customer.addressDetails?.entreCalle1 || '',
          entreCalle2: existingOrder.customer.addressDetails?.entreCalle2 || '',
          ciudad: existingOrder.customer.addressDetails?.ciudad || '',
          codigoPostal: existingOrder.customer.addressDetails?.codigoPostal || '',
          provincia: '',
          pais: '',
          latitud: '',
          longitud: '',
        },
        device: {
          tipoId: 0, // Will need to look up from name
          marcaId: 0, // Will need to look up from name
          modelo: existingOrder.device.model || '',
          nroSerie: existingOrder.device.serialNumber || '',
          serBus: '',
          ubicacion: existingOrder.device.ubicacion || '',
          accesorios: existingOrder.device.accesorios || '',
        },
        comercio: {
          comercioId: 0,
          telefono: '',
        },
        garantia: existingOrder.isGarantia,
        domicilio: existingOrder.isDomicilio,
        presupuesto: existingOrder.presupuesto?.toString() || '',
        montoFinal: existingOrder.montoFinal?.toString() || '',
        responsableId: existingOrder.responsable?.userId || 0,
        tecnicoId: existingOrder.technician?.userId || 0,
        fechaCompra: '',
      });
    }
  }, [editMode, existingOrder]);

  // Update device type and brand IDs when options are loaded (for edit mode)
  useEffect(() => {
    if (editMode && existingOrder && tipoOptions.length > 0) {
      const matchedTipo = tipoOptions.find(
        (t) => t.name.toLowerCase() === existingOrder.device.deviceType?.toLowerCase()
      );
      if (matchedTipo) {
        setFormData((prev) => ({
          ...prev,
          device: { ...prev.device, tipoId: matchedTipo.id },
        }));
      }
    }
  }, [editMode, existingOrder, tipoOptions]);

  useEffect(() => {
    if (editMode && existingOrder && marcaOptions.length > 0) {
      const matchedMarca = marcaOptions.find(
        (m) => m.name.toLowerCase() === existingOrder.device.brand?.toLowerCase()
      );
      if (matchedMarca) {
        setFormData((prev) => ({
          ...prev,
          device: { ...prev.device, marcaId: matchedMarca.id },
        }));
      }
    }
  }, [editMode, existingOrder, marcaOptions]);

  // Load dropdown options from API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tiposRes, marcasRes, tecnicosRes, responsablesRes, comerciosRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/device-types`),
          fetch(`${API_BASE_URL}/api/brands`),
          fetch(`${API_BASE_URL}/api/technicians`),
          fetch(`${API_BASE_URL}/api/responsibles`),
          fetch(`${API_BASE_URL}/api/comercios`),
        ]);

        if (tiposRes.ok) {
          const tipos = await tiposRes.json();
          setTipoOptions(tipos.map((t: any) => ({ id: t.id, name: t.name })));
        }
        if (marcasRes.ok) {
          const marcas = await marcasRes.json();
          setMarcaOptions(marcas.map((m: any) => ({ id: m.id, name: m.name })));
        }
        if (tecnicosRes.ok) {
          const tecnicos = await tecnicosRes.json();
          setTecnicoOptions(tecnicos.map((t: any) => ({ id: t.id, name: t.name })));
        }
        if (responsablesRes.ok) {
          const responsables = await responsablesRes.json();
          setResponsableOptions(responsables.map((r: any) => ({ id: r.id, name: r.name })));
        }
        if (comerciosRes.ok) {
          const comercios = await comerciosRes.json();
          setComercioOptions(comercios.map((c: any) => ({ id: c.id, code: c.code, telefono: c.telefono })));
        }
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    };

    fetchOptions();
  }, []);

  // Load Google Maps API
  useEffect(() => {
    if (window.google?.maps?.places) {
      setGoogleLoaded(true);
      return;
    }

    // Define callback function
    window.initGoogleMapsAutocomplete = () => {
      setGoogleLoaded(true);
    };

    // Check if script is already loading
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsAutocomplete`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup is optional - keep script loaded for performance
    };
  }, []);

  // Initialize Google Places Autocomplete
  const initializeAutocomplete = useCallback(() => {
    if (!googleLoaded || !addressInputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      { types: ['geocode'] }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.address_components) return;

      // Component mapping like in baseline
      const componentForm: Record<string, 'short_name' | 'long_name'> = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name',
      };

      const addressData: Record<string, string> = {};
      
      for (const component of place.address_components) {
        const addressType = component.types[0];
        if (componentForm[addressType]) {
          addressData[addressType] = component[componentForm[addressType]];
        }
      }

      // Update form with parsed address
      setFormData((prev) => ({
        ...prev,
        customer: {
          ...prev.customer,
          direccion: place.formatted_address || '',
          calle: addressData['route'] || '',
          altura: addressData['street_number'] || '',
          ciudad: addressData['locality'] || '',
          codigoPostal: addressData['postal_code'] || '',
          provincia: addressData['administrative_area_level_1'] || '',
          pais: addressData['country'] || '',
          latitud: place.geometry?.location?.lat()?.toString() || '',
          longitud: place.geometry?.location?.lng()?.toString() || '',
        },
      }));
    });

    // Bias results to user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const circle = new window.google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy,
        });
        autocompleteRef.current?.setBounds(circle.getBounds());
      });
    }
  }, [googleLoaded]);

  useEffect(() => {
    initializeAutocomplete();
  }, [initializeAutocomplete]);

  // DNI autocomplete function
  const handleDniLookup = useCallback(async (dni: string) => {
    if (!dni || dni.length < 7) {
      setDniFound(false);
      return;
    }

    setIsSearchingDni(true);
    setDniFound(false);

    try {
      const client = await getClientByDni(dni);
      if (client) {
        // Auto-fill customer data from found client
        setFormData((prev) => ({
          ...prev,
          customer: {
            clienteId: client.clienteId,
            firstName: client.nombre,
            lastName: client.apellido,
            dni: client.dni?.toString() || dni,
            email: client.email || '',
            phone: client.telefono || '',
            celular: client.celular || '',
            direccion: client.direccion,
            calle: client.addressDetails?.calle || '',
            altura: client.addressDetails?.altura || '',
            entreCalle1: client.addressDetails?.entreCalle1 || '',
            entreCalle2: client.addressDetails?.entreCalle2 || '',
            ciudad: client.addressDetails?.ciudad || client.localidad || '',
            codigoPostal: client.addressDetails?.codigoPostal || '',
            provincia: client.addressDetails?.provincia || '',
            pais: client.addressDetails?.pais || '',
            latitud: client.latitud?.toString() || '',
            longitud: client.longitud?.toString() || '',
          },
        }));
        setDniFound(true);
      }
    } catch (error) {
      console.error('Error looking up DNI:', error);
    } finally {
      setIsSearchingDni(false);
    }
  }, []);

  // Handle DNI change with debounced lookup
  const handleDniChange = (value: string) => {
    updateCustomer('dni', value);
    setDniFound(false);

    // Clear existing timeout
    if (dniSearchTimeoutRef.current) {
      clearTimeout(dniSearchTimeoutRef.current);
    }

    // Debounce the search (wait 500ms after user stops typing)
    if (value.length >= 7) {
      dniSearchTimeoutRef.current = setTimeout(() => {
        handleDniLookup(value);
      }, 500);
    }
  };

  // Manual DNI search button click
  const handleDniSearchClick = () => {
    if (formData.customer.dni) {
      handleDniLookup(formData.customer.dni);
    }
  };

  const updateCustomer = (field: keyof CustomerData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
  };

  const updateDevice = (field: keyof DeviceData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      device: { ...prev.device, [field]: value },
    }));
  };

  const handleComercioChange = (comercioId: number) => {
    const comercio = comercioOptions.find((c) => c.id === comercioId);
    setFormData((prev) => ({
      ...prev,
      comercio: {
        comercioId,
        telefono: comercio?.telefono || '',
      },
    }));
  };

  const handleNoEmail = () => {
    setFormData((prev) => ({
      ...prev,
      customer: { ...prev.customer, email: 'noaplica@noaplica.com' },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la orden');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {editMode ? (
              <>
                <Pencil className="h-5 w-5 inline mr-2" />
                Editar Orden #{existingOrder?.orderNumber}
              </>
            ) : (
              'Nueva Orden de Reparación'
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : editMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Order Options Row 1 */}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <EditableField
              label="Presupuesto"
              value={formData.presupuesto}
              onChange={(val) => setFormData((prev) => ({ ...prev, presupuesto: val }))}
              type="number"
              placeholder="0.00"
            />
            <EditableField
              label="Monto Final"
              value={formData.montoFinal}
              onChange={(val) => setFormData((prev) => ({ ...prev, montoFinal: val }))}
              type="number"
              placeholder="0.00"
            />
            <SelectField
              label="Responsable"
              value={formData.responsableId}
              onChange={(val) => setFormData((prev) => ({ ...prev, responsableId: val }))}
              options={responsableOptions}
              placeholder="Seleccione responsable"
              required
            />
            <SelectField
              label="Técnico"
              value={formData.tecnicoId}
              onChange={(val) => setFormData((prev) => ({ ...prev, tecnicoId: val }))}
              options={tecnicoOptions}
              placeholder="Seleccione técnico"
              required
            />
            <CheckboxField
              label="Domicilio"
              checked={formData.domicilio}
              onChange={(checked) => setFormData((prev) => ({ ...prev, domicilio: checked }))}
            />
            <CheckboxField
              label="Garantía"
              checked={formData.garantia}
              onChange={(checked) => setFormData((prev) => ({ ...prev, garantia: checked }))}
            />
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
            Datos del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                DNI <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1">
                <Input
                  type="text"
                  value={formData.customer.dni}
                  onChange={(e) => handleDniChange(e.target.value)}
                  placeholder="DNI"
                  className={`h-8 text-sm flex-1 ${dniFound ? 'border-green-500 bg-green-50' : ''}`}
                  required
                  autoComplete="off"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className={`h-8 px-2 ${dniFound ? 'text-green-600 border-green-500' : ''}`}
                  title={dniFound ? "Cliente encontrado" : "Buscar cliente"}
                  onClick={handleDniSearchClick}
                  disabled={isSearchingDni || !formData.customer.dni}
                >
                  {isSearchingDni ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : dniFound ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {dniFound && (
                <p className="text-xs text-green-600">✓ Cliente encontrado, datos autocompletados</p>
              )}
            </div>
            <EditableField
              label="Nombre"
              value={formData.customer.firstName}
              onChange={(val) => updateCustomer('firstName', val)}
              required
            />
            <EditableField
              label="Apellido"
              value={formData.customer.lastName}
              onChange={(val) => updateCustomer('lastName', val)}
              required
            />
            <EditableField
              label="Email"
              value={formData.customer.email}
              onChange={(val) => updateCustomer('email', val)}
              type="email"
              actionButton={
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-red-600 hover:text-red-700" 
                  title="Omitir email"
                  onClick={handleNoEmail}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              }
            />
            <EditableField
              label="Teléfono"
              value={formData.customer.phone}
              onChange={(val) => updateCustomer('phone', val)}
              type="tel"
            />
            <EditableField
              label="Celular"
              value={formData.customer.celular}
              onChange={(val) => updateCustomer('celular', val)}
              type="tel"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Section with Google Places Autocomplete */}
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
          {/* Address autocomplete field */}
          <div className="mb-4">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Buscar Dirección
            </Label>
            <Input
              ref={addressInputRef}
              id="address-autocomplete"
              type="text"
              value={formData.customer.direccion}
              onChange={(e) => updateCustomer('direccion', e.target.value)}
              placeholder="Ingrese una dirección..."
              className="h-8 text-sm"
              autoComplete="off"
            />
            {!googleLoaded && (
              <p className="text-xs text-muted-foreground mt-1">Cargando Google Maps...</p>
            )}
          </div>
          {/* Parsed address fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3">
            <EditableField
              label="Calle"
              value={formData.customer.calle}
              onChange={(val) => updateCustomer('calle', val)}
            />
            <EditableField
              label="Altura"
              value={formData.customer.altura}
              onChange={(val) => updateCustomer('altura', val)}
            />
            <EditableField
              label="Entre Calle 1"
              value={formData.customer.entreCalle1}
              onChange={(val) => updateCustomer('entreCalle1', val)}
            />
            <EditableField
              label="Entre Calle 2"
              value={formData.customer.entreCalle2}
              onChange={(val) => updateCustomer('entreCalle2', val)}
            />
            <EditableField
              label="Ciudad"
              value={formData.customer.ciudad}
              onChange={(val) => updateCustomer('ciudad', val)}
            />
            <EditableField
              label="Código Postal"
              value={formData.customer.codigoPostal}
              onChange={(val) => updateCustomer('codigoPostal', val)}
            />
          </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3">
            <SelectField
              label="Tipo"
              value={formData.device.tipoId}
              onChange={(val) => updateDevice('tipoId', val)}
              options={tipoOptions}
              placeholder="Seleccione dispositivo"
              required
            />
            <SelectField
              label="Marca"
              value={formData.device.marcaId}
              onChange={(val) => updateDevice('marcaId', val)}
              options={marcaOptions}
              placeholder="Seleccione marca"
              required
            />
            <EditableField
              label="Nro. Serie"
              value={formData.device.nroSerie}
              onChange={(val) => updateDevice('nroSerie', val)}
              required
            />
            <EditableField
              label="Modelo"
              value={formData.device.modelo}
              onChange={(val) => updateDevice('modelo', val)}
              required
            />
            <EditableField
              label="Ubicación"
              value={formData.device.ubicacion}
              onChange={(val) => updateDevice('ubicacion', val)}
            />
            <EditableField
              label="Accesorios"
              value={formData.device.accesorios}
              onChange={(val) => updateDevice('accesorios', val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Warranty/Comercio Section - Only visible when Garantia is checked */}
      {formData.garantia && (
        <Card className="border-slate-200 border-green-300 bg-green-50/30">
          <CardHeader className="py-3 px-4 bg-green-50/50">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Datos de Garantía
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Comercio
                </Label>
                <select
                  value={formData.comercio.comercioId}
                  onChange={(e) => handleComercioChange(parseInt(e.target.value, 10))}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value={0}>Seleccione comercio...</option>
                  {comercioOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
              <EditableField
                label="Teléfono Comercio"
                value={formData.comercio.telefono}
                onChange={(val) => setFormData((prev) => ({ ...prev, comercio: { ...prev.comercio, telefono: val } }))}
                type="tel"
              />
              <EditableField
                label="Fecha de Compra"
                value={formData.fechaCompra}
                onChange={(val) => setFormData((prev) => ({ ...prev, fechaCompra: val }))}
                type="date"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
};

export default OrderCreateView;
