export interface ActiveRideResponse {
    id?: string;
    status?: string;
    [key: string]: unknown; // Em chưa xem đc trường của api nên để tạm kiểu này anh ạ:))))
}

export class OrderService {
    private baseURL = 'https://sys.happytrip.vn/api';

    async getActiveRide(): Promise<ActiveRideResponse | null>{
        try {
            const response = await $fetch<ActiveRideResponse | null>(`${this.baseURL}/order/active`, {
                method: 'GET',
                credentials: 'include'
            });
            return response;
        } catch (error) {
            console.error('Error fetching active ride:', error);
            throw error;
        }
    } 
}

export const orderService = new OrderService();