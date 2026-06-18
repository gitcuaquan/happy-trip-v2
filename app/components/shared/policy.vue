<template>
  <UModal
    title="Điều khoản & lưu ý khi đặt xe"
    :ui="{
      body: 'space-y-4 text-sm text-gray-700 dark:text-gray-300 max-h-[70vh] overflow-y-auto',
    }"
    scrollable
  >
    <slot>
      <UButton label="Điều khoản & lưu ý" color="neutral" variant="subtle" />
    </slot>

    <template #body>
      <!-- Giá trọn gói -->
      <p>
        Giá hiển thị là giá trọn gói theo lộ trình đã đặt, không phát sinh thêm
        chi phí ngoài các trường hợp được nêu dưới đây.
      </p>

      <!-- Đã bao gồm -->
      <div>
        <p class="font-semibold text-green-600 mb-1">✅ Đã bao gồm:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Xe riêng phục vụ theo yêu cầu.</li>
          <li>Đi cao tốc (nếu tuyến đường có cao tốc).</li>
          <li>Đón và trả tận nơi theo địa chỉ khách yêu cầu.</li>
          <li>Thời gian khởi hành linh hoạt theo lịch đặt.</li>
        </ul>
      </div>

      <!-- Chưa bao gồm -->
      <div>
        <p class="font-semibold text-red-500 mb-1">❌ Chưa bao gồm:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            Phí qua phà, bến tàu hoặc các khoản thu hộ tương tự (nếu phát sinh).
          </li>
        </ul>
      </div>

      <!-- Thanh toán -->
      <p>
        💳 Không cần đặt cọc. Quý khách thanh toán trực tiếp cho tài xế khi kết
        thúc chuyến đi.
        <br />
        Cam kết sử dụng xe đời mới, sạch sẽ, đầy đủ tiện nghi. Ngay sau khi xếp
        xong xe, Happy Trip sẽ gửi đầy đủ thông tin tài xế và phương tiện (họ
        tên, số điện thoại, biển số xe, dòng xe) qua Zalo OA.
      </p>

      <!-- Số lượng hành khách -->
      <div>
        <p class="font-semibold mb-1">👥 Số lượng hành khách:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Xe 5 chỗ: tối đa 04 hành khách.</li>
          <li>Xe 7 chỗ: tối đa 06 hành khách.</li>
          <li>Trẻ em được tính là 01 hành khách.</li>
        </ul>
      </div>

      <!-- Thời gian chờ -->
      <div>
        <p class="font-semibold mb-1">⏱ Thời gian chờ:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Miễn phí 30 phút đầu tiên kể từ giờ đón đã xác nhận.</li>
          <li>
            Từ phút thứ 31 trở đi: phụ thu 100.000đ/giờ (làm tròn theo giờ).
          </li>
        </ul>
        <p class="mt-1">
          Quý khách vui lòng có mặt đúng giờ. Thời gian chờ được tính từ giờ đón
          đã xác nhận đặt xe.
        </p>
      </div>

      <!-- Thay đổi lịch trình -->
      <div>
        <p class="font-semibold mb-1">🔄 Thay đổi lịch trình:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            Các yêu cầu thay đổi thời gian đón, địa điểm đón/trả hoặc lộ trình
            sau khi đã xác nhận có thể làm thay đổi giá cước.
          </li>
          <li>
            Quãng đường phát sinh ngoài lộ trình được tính thêm 10.000đ/km.
          </li>
        </ul>
      </div>

      <!-- Hủy chuyến -->
      <div>
        <p class="font-semibold mb-1">🚫 Hủy chuyến:</p>
        <p>
          Trường hợp khách hủy chuyến sát giờ hoặc khi tài xế đã di chuyển đến
          điểm đón, Happy Trip có quyền từ chối phục vụ các đơn đặt xe tiếp theo
          hoặc yêu cầu khách thanh toán các chi phí phát sinh thực tế (nếu có).
        </p>
      </div>

      <!-- Hành lý -->
      <div>
        <p class="font-semibold mb-1">🧳 Hành lý:</p>
        <p>
          Vui lòng thông báo chi tiết vào <strong>"GHI CHÚ"</strong> nếu mang
          theo nhiều hành lý, xe đẩy em bé, xe đạp, dụng cụ thể thao hoặc các
          vật dụng cồng kềnh để được bố trí loại xe phù hợp.
        </p>
      </div>

      <!-- Ghế trẻ em -->
      <div>
        <p class="font-semibold mb-1">🪑 Ghế trẻ em:</p>
        <p>
          Nếu có nhu cầu sử dụng ghế trẻ em (baby seat), vui lòng thông báo vào
          <strong>"GHI CHÚ"</strong> khi đặt xe để Happy Trip kiểm tra khả năng
          cung cấp.
        </p>
      </div>

      <!-- Thú cưng -->
      <div>
        <p class="font-semibold mb-1">🐾 Thú cưng & vệ sinh phương tiện:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            Khách mang theo thú cưng vui lòng chuẩn bị lồng, dây dắt, bỉm hoặc
            các biện pháp phù hợp để đảm bảo vệ sinh và an toàn trong suốt
            chuyến đi.
          </li>
          <li>
            Trường hợp phát sinh vệ sinh đặc biệt (lông thú cưng, thức ăn đổ,
            nôn ói...), khách hàng vui lòng thanh toán chi phí vệ sinh từ
            150.000đ đến 500.000đ tùy tình trạng thực tế.
          </li>
        </ul>
      </div>

      <!-- Tài sản cá nhân -->
      <div>
        <p class="font-semibold mb-1">💼 Tài sản cá nhân:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            Quý khách vui lòng tự bảo quản tiền mặt, giấy tờ tùy thân, trang
            sức, thiết bị điện tử và các tài sản có giá trị khác trong suốt
            chuyến đi.
          </li>
          <li>
            Vui lòng kiểm tra hành lý và tài sản cá nhân trước khi rời xe.
          </li>
        </ul>
      </div>

      <!-- Bất khả kháng -->
      <div>
        <p class="font-semibold mb-1">⚠️ Điều kiện bất khả kháng:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            Thời gian di chuyển thực tế có thể thay đổi do tình hình giao thông,
            thời tiết, va chạm, ngập lụt, sự cố phương tiện, phà tạm ngưng hoạt
            động hoặc các yếu tố khách quan ngoài khả năng kiểm soát của Happy
            Trip.
          </li>
          <li>
            Trong các trường hợp bất khả kháng, Happy Trip sẽ phối hợp cùng
            khách hàng và tài xế để đưa ra phương án phù hợp nhất.
          </li>
        </ul>
      </div>

      <!-- Dịp lễ Tết -->
      <div>
        <p class="font-semibold mb-1">🎉 Dịp lễ, Tết:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>
            Giá cước có thể được điều chỉnh theo từng thời điểm lễ, Tết (được
            thể hiện ngay khi đặt xe).
          </li>
          <li>
            Thời gian di chuyển thực tế có thể kéo dài hơn dự kiến do tình trạng
            ùn tắc giao thông.
          </li>
        </ul>
      </div>

      <!-- Xác nhận -->
      <p class="font-semibold text-center border-t pt-4">
        Bằng việc đặt xe, khách hàng xác nhận đã đọc, hiểu và đồng ý với các
        điều khoản trên.
      </p>
    </template>
  </UModal>
</template>
