export interface OrderSearchCriteria {
  orderNumber?: number;
  customerName?: string;
  dni?: string;
  technicianName?: string;
  status?: string;
  brand?: string;
  deviceType?: string;
  serialNumber?: string;
  fromDate?: string;
  toDate?: string;
  maxResults?: number;
}

export interface OrderSummary {
  orderNumber: number;
  customerName: string;
  deviceInfo: string;
  status: string;
  entryDate: string;
  estimatedDeliveryDate?: string;
  estimatedPrice?: number;
}

export interface OrderDetails {
  orderNumber: number;
  customer: CustomerInfo;
  device: DeviceInfo;
  repair: RepairInfo;
  technician: UserInfo;
  details: RepairDetailInfo[];
}

export interface CustomerInfo {
  customerId: number;
  fullName: string;
  dni?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface DeviceInfo {
  brand: string;
  deviceType: string;
  serialNumber?: string;
}

export interface RepairInfo {
  status: string;
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
