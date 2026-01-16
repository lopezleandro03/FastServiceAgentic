export interface OrderSearchCriteria {
  orderNumber?: number;
  customerName?: string;
  dni?: string;
  technicianName?: string;
  status?: string;
  statuses?: string[];
  brand?: string;
  deviceType?: string;
  serialNumber?: string;
  model?: string;
  fromDate?: string;
  toDate?: string;
  maxResults?: number;
}

export interface OrderSummary {
  orderNumber: number;
  customerName: string;
  deviceInfo: string;
  model?: string;
  status: string;
  entryDate: string;
  estimatedDeliveryDate?: string;
  estimatedPrice?: number;
}

export interface OrderDetails {
  orderNumber: number;
  status: string;
  statusDate?: string;
  responsable?: UserInfo;
  technician?: UserInfo;
  presupuesto?: number;
  montoFinal?: number;
  isDomicilio: boolean;
  isGarantia: boolean;
  entryDate?: string;
  customer: CustomerInfo;
  device: DeviceInfo;
  repair: RepairInfo;
  details: RepairDetailInfo[];
  novedades: NovedadInfo[];
}

export interface CustomerInfo {
  customerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dni?: string;
  email?: string;
  phone?: string;
  celular?: string;
  address?: string;
  addressDetails?: AddressInfo;
}

export interface AddressInfo {
  fullAddress?: string;
  calle?: string;
  altura?: string;
  entreCalle1?: string;
  entreCalle2?: string;
  ciudad?: string;
  codigoPostal?: string;
}

export interface DeviceInfo {
  brand: string;
  deviceType: string;
  serialNumber?: string;
  model?: string;
  ubicacion?: string;
  accesorios?: string;
}

export interface NovedadInfo {
  id: number;
  fecha: string;
  tipo: string;
  monto?: number;
  observacion?: string;
  usuarioId: number;
  usuarioNombre?: string;
}

export interface RepairInfo {
  status: string;
  estadoReparacionId?: number;
  observations?: string;
  entryDate: string;
  exitDate?: string;
  estimatedDeliveryDate?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  underWarranty: boolean;
}

export interface UserInfo {
  userId: number;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface RepairDetailInfo {
  description: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderStatus {
  statusId: number;
  name: string;
  description?: string;
  isActive: boolean;
}
