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
    note?: string
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
    note: string = '';

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


// === LOGIN ===
export interface CustomerProfile {
  id: string
  full_name: string
  phone: string
  created_at: string
} 

export interface ConfirmOtpResponse {
  token: string
  customer: CustomerProfile
  order?: unknown 
} 


export interface LoginResponse {
  accessToken: string
  id: string
  fullName: string
  phone: string
  tokenType: string
}


// === ADMIN ===
export interface AdminProfile {
  id: string
  full_name: string
  phone: string
  role?: string
  created_at?: string
}

export interface AdminLoginResponse {
  accessToken: string
  user: AdminProfile
  tokenType?: string
}


// === ORDER ===

// Phân trang 
export interface OrderListQueryParams {
  page?: number
  limit?: number
  sort_by?: string
}

// Bộ lọc lịch sử chuyến xe
export interface OrderListBodyFilter {
  keyword?: string
  from_date_of_destination?: string
  to_date_of_destination?: string
  status_type?: number
  order_status_list?: number[]
  city_diemdon?: string
  city_diemden?: string
}

// Thông tin trả về
export interface PaginationInfo{
  page: number
  limit: number
  count: number
  total_page: number
}

// Form địa chỉ 
export interface LocationInfo{
  address_1: string
  city: string
  district: string
} 

// Form thông tin
export interface CustomerInfo {
  full_name: string
  phone: string
}

// Form chuyển xe 
export interface Order {
  id: string; // ID chuyến xe
  short_id: string; // Mã ngắn hiển thị cho khách
  id_service: string; // ID dịch vụ (ví dụ: xe 4 chỗ, xe 7 chỗ)
  name_service: string; // Tên dịch vụ (ví dụ: Xe 4 chỗ, Xe 7 chỗ)
  departure: LocationInfo; // Thông tin điểm đi
  destination: LocationInfo; // Thông tin điểm đến
  date_of_destination: string; // Ngày giờ dự kiến đến nơi
  quantity: number; // Số lượng (thường là 1, nhưng có thể có nhiều hơn nếu đặt cho nhóm)
  price_original: number; // Giá gốc của chuyến xe
  price_after: number; // Giá sau khi áp dụng khuyến mãi (nếu có)
  price_guest_after: number; // Giá khách phải trả sau khi áp dụng khuyến mãi (có thể khác price_after nếu có phí phụ thêm)
  price_guest: number; // Giá khách phải trả trước khi áp dụng khuyến mãi
  price: number; // Giá cuối cùng của chuyến xe (có thể là price_guest_after hoặc price_after tùy vào logic tính giá)
  status_type: number; // Mã trạng thái chuyến xe: 0-Chờ tài xế, 1-Tài xế đã nhận, 2-Đang hoạt động, 3-Hoàn thành, 4-Đã hủy
  status_name: string; // Tên trạng thái chuyến xe
  customer: CustomerInfo; // Thông tin khách hàng đặt chuyến xe
  created: string; // Ngày giờ tạo chuyến xe
  distance: number; // Quãng đường dự kiến của chuyến xe (tính bằng km)
  note?: string; // Ghi chú của khách (vd: có trẻ em, thú cưng, yêu cầu loại xe...)
}

// Danh sách chuyến xe 
export interface OrderListResponse {
  pagination: PaginationInfo;
  data: Order[];
}

// Hủy chuyến xe
export interface ActionResponse {
  success?: boolean;
  message?: string;
}


// === PAGE / BLOG (admin) ===

// Body gửi lên POST/PUT /api/page — mọi field theo swagger đều nullable
export interface PagePayload {
  id?: string
  short_id?: string
  title?: string
  slug?: string
  status?: boolean
  content?: string
  thumbnail?: string
}

// Response của POST /api/upload — swagger không document
// cover các shape phổ biến để code chạy ngay
export interface UploadResponse {
  url?: string
  path?: string
  fileName?: string
  data?: { url?: string; path?: string }
}