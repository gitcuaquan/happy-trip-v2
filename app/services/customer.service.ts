import type { CustomerProfile, ConfirmOtpResponse, LoginResponse } from '~/type'

export class CustomerService {
    private baseURL = 'https://sysdev.happytrip.vn/api'


    // Gửi OTP về SĐT để đăng nhập
    async sendOtpLogin(phone: string): Promise<void> {
        await $fetch(`${this.baseURL}/customer_app/login`, {
            method: 'POST',
            body: { phone }
        })
    }


    async confirmOtpLogin(otp: string): Promise<ConfirmOtpResponse> {
        return await $fetch<ConfirmOtpResponse>(`${this.baseURL}/customer_app/confirm-otp`, {
            method: 'GET',
            query: { otpSMS: otp }
        })
    }

    async login(phone: string, password: string): Promise<LoginResponse> {
        return await $fetch<LoginResponse>(`${this.baseURL}/customer_app/login`, {
            method: 'POST',
            body: { phone, password }
        })
    }


    // Đăng ký
    async register(phone: string, password: string, full_name: string): Promise<void> {
        await $fetch(`${this.baseURL}/customer_app/register`, {
            method: 'POST',
            body: { phone, password, full_name }
        })
    }

    // confirm OTP sau register
    async confirmOtpRegister(otp: string): Promise<ConfirmOtpResponse> {
        return await $fetch<ConfirmOtpResponse>(`${this.baseURL}/customer_app/confirm-otp`, {
            method: 'GET',
            query: { otpSMS: otp }
        })
    }

    // Lấy thông tin customer hiện tại từ token
    async getMe(token: string): Promise<CustomerProfile> {
        return await $fetch<CustomerProfile>(
            `${this.baseURL}/customer_app/me`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )

    }

}
export const customerService = new CustomerService()