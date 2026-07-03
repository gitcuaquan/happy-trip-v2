import type {
    CustomerProfile,
    ConfirmOtpResponse,
    LoginResponse,
    CheckPhoneResponse,
    VerifyLoginOtpResponse,
} from '~/type'

export class CustomerService {
    private get baseURL() {
        return useRuntimeConfig().public.apiBase + '/api'
    }


    // Gửi OTP về SĐT để đăng nhập (luồng cũ - giữ lại cho khả năng tương thích)
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

    // Đăng nhập bằng mật khẩu (tài khoản đã có mật khẩu)
    async login(phone: string, password: string): Promise<LoginResponse> {
        return await $fetch<LoginResponse>(`${this.baseURL}/customer_app/login`, {
            method: 'POST',
            body: { phone, password }
        })
    }

    // === LUỒNG ĐĂNG NHẬP MỚI ===

    // Kiểm tra số điện thoại: tồn tại? đã có mật khẩu?
    async checkPhone(phone: string): Promise<CheckPhoneResponse> {
        return await $fetch<CheckPhoneResponse>(
            `${this.baseURL}/customer_app/check-phone`,
            {
                method: 'POST',
                body: { phone }
            }
        )
    }

    // Gửi OTP cho tài khoản chưa có mật khẩu (guest từ booking)
    async sendLoginOtp(phone: string): Promise<void> {
        await $fetch(`${this.baseURL}/customer_app/send-login-otp`, {
            method: 'POST',
            body: { phone }
        })
    }

    // Xác thực OTP -> trả token + customer (coi như đã login)
    async verifyLoginOtp(phone: string, otp: string): Promise<VerifyLoginOtpResponse> {
        return await $fetch<VerifyLoginOtpResponse>(
            `${this.baseURL}/customer_app/verify-login-otp`,
            {
                method: 'POST',
                body: { phone, otp }
            }
        )
    }

    // Tạo mật khẩu (cho tài khoản chưa có)
    async createPassword(token: string, newPassword: string): Promise<void> {
        await $fetch(`${this.baseURL}/customer_app/create-password`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: { new_password: newPassword }
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
