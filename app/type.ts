export interface OrderPreview {
    date_of_destination: Date | null,
    //  khởi hành
    departure_city: string,
    departure_dictrict: string
    departure_address_1: string
    // điểm đến
    destination_city: string
    destination_dictrict: string
    destination_address_1: string
    id_service: string
}

export class OrderDetail {
    short_id: string = '';
    id_service: string = '';
    name_service: string = '';
    departure: Address = new Address();
    destination: Address = new Address();
    date_of_destination: string = '';
    quantity: number = 0;
    price_original: number = 0;
    price_after: number = 0;
    price_guest_after: number = 0;
    price_guest: number = 0;
    price_system_original: number = 0;
    net_profit_original: number = 0;
    distance: number = 0;
    sub_fees: {
        sub_fee_price: number;
        sub_fees: any[];
    } = {
            sub_fee_price: 0,
            sub_fees: []
        };
    backhaul: {
        price: number;
        price_system: number;
        net_profit: number;
        expired_time: string;
        receive_with_backhaul_price: boolean;
        expired_time_in_milliseconds: number;
    } = {
            price: 0,
            price_system: 0,
            net_profit: 0,
            expired_time: '',
            receive_with_backhaul_price: false,
            expired_time_in_milliseconds: 0
        };
    active_backhaul: boolean = false;
    created: string = '';
    customer: {
        full_name: string;
        phone: string;
    } = {
            full_name: '',
            phone: ''
        };
    status_type: number = 0;
    status_name: string = '';
    total_transaction: number = 0;
    creator: {
        user_id: string;
        user_phone: string;
        user_type: string;
    } = {
            user_id: '',
            user_phone: '',
            user_type: ''
        };
    active_time: string = '';
    accept_expired_time_in_milliseconds: number = 0;
    price: number = 0;
    price_system: number = 0;
    net_profit: number = 0;

    constructor(data: Partial<OrderDetail>) {
        Object.assign(this, data);
    }
}

export class Address {
    address_1: string = '';
    city: string = '';
    district: string = '';

    constructor(data?: Address) {
        if (data) {
            Object.assign(this, data);
        }
    }
}


export class Article {
  id: string = ''
  slug: string = ''
  name: string = ''
  title?: string
  thumbnail?: string
  excerpt?: string
  created_at?: string
  content: any

  constructor(data?: Partial<Article>) {
    if (data) {
      Object.assign(this, data)
    }
  }
}

export interface PageListResponse {
  pagination: {
    page: number
    limit: number
    count: number
    total_page: number
  }
  data: Article[]
}

// ========== DRIVER TYPES ==========

export interface Transport {
  name: string
  type: number
  type_name: string
  license_plate: string
  hang_xe: string
  ten_xe: string
  created_year?: string
}

export interface BankInfo {
  name: string
  bank_card: string
  bank_name: string
}

export interface DriverProfile {
  id: string
  full_name: string
  phone: string
  status_type: number
  status_name: string
  transport?: Transport
  wallet_id?: string
  bank_info?: BankInfo
  created_at?: string
  isFreezen?: boolean
}

export interface WalletDetail {
  balance: number
  wallet_id: string
}

export interface Order {
  id: string
  short_id: string
  departure: { city: string; district: string; address_1: string }
  destination: { city: string; district: string; address_1: string }
  date_of_destination: string
  price_guest_after: number
  price_guest: number
  status_type: number
  status_name: string
  name_service: string
  time_label?: string
  customer?: { full_name: string; phone: string }
  created_at?: string
}

export interface Announcement {
  id: string
  title: string
  file?: string
  created_at: string
}


export type HistoryOrderStatus = 'in_progress' | 'completed' | 'cancelled'
 

export const HISTORY_STATUS_MAP: Record<number, HistoryOrderStatus> = {
  1:  'in_progress',
  5:  'completed',
  0:  'cancelled',
  '-1': 'cancelled',
} as unknown as Record<number, HistoryOrderStatus>
 

export interface HistoryOrder {
  id:                  string
  short_id:            string
  status:              HistoryOrderStatus  
  status_name:         string               
  departure:           Address              
  destination:         Address             
  date_of_destination: string              
  price_guest_after:   number              
  name_service:        string             
  distance?:           number              
  customer?: {
    full_name: string
    phone:     string
  }
}
 

export function formatAddress(addr: Address, shortForm = false): string {
  if (shortForm) return addr.city
  return [addr.address_1, addr.district, addr.city].filter(Boolean).join(', ')
}












