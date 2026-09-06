import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Admin } from '../models/Admin'
import { Article } from '../models/Article'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri || process.env.NUXT_MONGODB_URI

  if (!uri) {
    console.warn('⚠️ [MongoDB] Chưa cấu hình NUXT_MONGODB_URI!')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('⚡ [MongoDB] Kết nối cơ sở dữ liệu thành công!')

    // 1. Tự động seed tài khoản admin ban đầu nếu chưa tồn tại
    const existingAdmin = await Admin.findOne({ username: 'manhquan2k' })
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('0982315950', 10)
      await Admin.create({
        username: 'manhquan2k',
        password: hashedPassword,
        full_name: 'Tạ Mạnh Quân',
      })
      console.log('🎉 [MongoDB] Đã khởi tạo tài khoản Admin ban đầu: manhquan2k / 0982315950 (Tạ Mạnh Quân)')
    }

    // 2. Tự động seed bài viết mẫu nếu database trống
    const articleCount = await Article.countDocuments()
    if (articleCount === 0) {
      await Article.create([
        {
          title: 'Kinh Nghiệm Thuê Xe Riêng Đi Vũng Tàu Trọn Gói Tiết Kiệm & An Toàn',
          slug: 'kinh-nghiem-thue-xe-rieng-di-vung-tau',
          route_slug: 'xe-rieng-tphcm-di-vung-tau',
          excerpt: 'Bí quyết đặt xe riêng 100% không ghép từ Sài Gòn đi Vũng Tàu, Hồ Tràm đón trả tận sảnh khách sạn với giá minh bạch không phụ phí.',
          content: `<h2>1. Vì sao nên chọn xe riêng khi đi Vũng Tàu?</h2><p>Di chuyển từ TP.HCM đi Vũng Tàu bằng xe riêng mang lại sự thoải mái tuyệt đối cho gia đình có người lớn tuổi và trẻ nhỏ. Xe đón tận nhà, trả tận sảnh khách sạn hoặc resort mà không phải chen chúc bắt khách dọc đường.</p><h2>2. Lộ trình cao tốc Long Thành - Dầu Giây</h2><p>Thời gian di chuyển chỉ mất khoảng 2 tiếng đến 2 tiếng 30 phút qua cao tốc êm ái, xe đời mới rộng rãi.</p><h2>3. Đặt xe riêng tại Happy Trip</h2><p>Happy Trip cam kết bao trọn xe 100%, đón đúng giờ hẹn, tài xế lịch sự văn minh và giá trọn gói niêm yết minh bạch.</p>`,
          thumbnail: '/images/vung-tau.jpg',
          category: 'blog',
          status: true,
          reading_time: 4,
          author_name: 'Tạ Mạnh Quân',
          meta_title: 'Kinh Nghiệm Thuê Xe Riêng Đi Vũng Tàu Trọn Gói - Happy Trip',
          meta_description: 'Bí quyết đặt xe riêng 100% không ghép từ Sài Gòn đi Vũng Tàu, Hồ Tràm đón trả tận nơi giá minh bạch.',
          focus_keyword: 'thuê xe riêng vũng tàu',
          published_at: new Date(),
        },
        {
          title: 'Cẩm Nang Thuê Xe Riêng Sài Gòn Đi Đà Lạt Cho Gia Đình Nghỉ Dưỡng',
          slug: 'cam-nang-thue-xe-rieng-sai-gon-di-da-lat',
          route_slug: 'xe-rieng-tphcm-di-da-lat',
          excerpt: 'Kinh nghiệm di chuyển bằng xe 7 chỗ MPV/SUV cao cấp lên phố hoa Đà Lạt êm ái, tài xế giàu kinh nghiệm đèo dốc.',
          content: `<h2>1. Lộ trình từ Sài Gòn lên Đà Lạt</h2><p>Hành trình dài khoảng 300km qua cao tốc Dầu Giây - Phan Thiết và đèo Prenn tuyệt đẹp. Chọn xe riêng 7 chỗ giúp cả nhà thoải mái nghỉ ngơi suốt chuyến đi.</p><h2>2. Dòng xe 7 chỗ MPV cao cấp tại Happy Trip</h2><p>Khoang hành lý rộng rãi chứa trọn vẹn vali và đồ ấm, ghế ngả sâu êm ái.</p>`,
          thumbnail: '/images/da-lat.jpg',
          category: 'blog',
          status: true,
          reading_time: 5,
          author_name: 'Tạ Mạnh Quân',
          meta_title: 'Cẩm Nang Thuê Xe Riêng Sài Gòn Đi Đà Lạt Cho Gia Đình - Happy Trip',
          meta_description: 'Kinh nghiệm di chuyển bằng xe riêng 7 chỗ cao cấp lên phố núi Đà Lạt trọn gói an toàn.',
          focus_keyword: 'thuê xe riêng đà lạt',
          published_at: new Date(),
        },
        {
          title: 'Quy Chế Hoạt Động & Tiêu Chuẩn Phục Vụ Của HappyTrip Express',
          slug: 'quy-che-hoat-dong-happytrip',
          excerpt: 'Toàn văn quy chế hoạt động, tiêu chuẩn dịch vụ xe riêng và nguyên tắc phục vụ khách hàng trên nền tảng HappyTrip.',
          content: `<h2>1. NGUYÊN TẮC HOẠT ĐỘNG</h2><p>HappyTrip là nền tảng kết nối dịch vụ vận chuyển hành khách bằng xe riêng hợp đồng theo lịch trình đặt trước.</p><h2>2. CAM KẾT CHẤT LƯỢNG</h2><p>100% chuyến xe là xe riêng, không bắt khách dọc đường, không đón ghép tiện chuyến trái yêu cầu.</p><h2>3. QUYỀN LỢI CỦA HÀNH KHÁCH</h2><p>Khách hàng được biết trước giá cước trọn gói, thông tin tài xế và biển số xe trước giờ khởi hành.</p>`,
          category: 'policy',
          status: true,
          author_name: 'Happy Trip Legal',
          meta_title: 'Quy Chế Hoạt Động & Tiêu Chuẩn Phục Vụ - Happy Trip',
          meta_description: 'Quy chế hoạt động và cam kết dịch vụ xe riêng chính thức từ HappyTrip Express.',
          published_at: new Date(),
        },
        {
          title: 'Chính Sách Bảo Mật Thông Tin Khách Hàng & Đối Tác',
          slug: 'chinh-sach-bao-mat-thong-tin',
          excerpt: 'Chính sách thu thập, lưu trữ và bảo vệ dữ liệu cá nhân của hành khách và đối tác tài xế theo quy định pháp luật.',
          content: `<h2>1. MỤC ĐÍCH THU THẬP THÔNG TIN</h2><p>HappyTrip thu thập số điện thoại và địa chỉ đón/trả chỉ nhằm mục đích điều phối tài xế và phục vụ chuyến đi an toàn.</p><h2>2. BẢO MẬT DỮ LIỆU</h2><p>Chúng tôi cam kết không chia sẻ dữ liệu cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>`,
          category: 'policy',
          status: true,
          author_name: 'Happy Trip Legal',
          meta_title: 'Chính Sách Bảo Mật Thông Tin - Happy Trip',
          meta_description: 'Chính sách bảo mật thông tin hành khách và đối tác tài xế của Happy Trip.',
          published_at: new Date(),
        },
      ])
      console.log('🎉 [MongoDB] Đã khởi tạo các bài viết mẫu chuẩn định vị thương hiệu!')
    }
  } catch (error) {
    console.error('❌ [MongoDB] Kết nối thất bại:', error)
  }
})