// Client list item for table display
export interface ClientListItem {
  clienteId: number;
  dni: number | null;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string;
  localidad: string | null;
  orderCount: number;
  lastOrderDate: string | null;
}

// Address details
export interface AddressDetails {
  calle: string | null;
  altura: string | null;
  entreCalle1: string | null;
  entreCalle2: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  provincia: string | null;
  pais: string | null;
}

// Order summary for client view
export interface ClientOrderSummary {
  orderNumber: number;
  status: string;
  deviceType: string;
  brand: string;
  model: string | null;
  createdAt: string;
  deliveredAt: string | null;
  finalPrice: number | null;
  isWarranty: boolean;
}

// Client stats
export interface ClientStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

// Full client details
export interface ClientDetails {
  clienteId: number;
  dni: number | null;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string;
  localidad: string | null;
  latitud: number | null;
  longitud: number | null;
  addressDetails: AddressDetails | null;
  orders: ClientOrderSummary[];
  stats: ClientStats;
}

// Paginated response for clients list
export interface ClientsListResponse {
  clients: ClientListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Client autocomplete response (for order creation)
export interface ClientAutocomplete {
  clienteId: number;
  dni: number | null;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string;
  localidad: string | null;
  latitud: number | null;
  longitud: number | null;
  addressDetails: AddressDetails | null;
}
