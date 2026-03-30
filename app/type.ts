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