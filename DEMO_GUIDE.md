# Hướng dẫn Demo Bảo vệ

## Chuẩn bị trước Demo

### 1. Kiểm tra hệ thống
- [ ] Backend đã chạy và accessible
- [ ] Frontend đã build và chạy
- [ ] Email service đã cấu hình (hoặc fallback mode hoạt động)
- [ ] Database có dữ liệu mẫu (3 thẻ RFID)
- [ ] Mạch Wokwi đã setup và test

### 2. Test toàn bộ flow
- [ ] Test quét thẻ RFID → nhận OTP
- [ ] Test nhập OTP đúng → Access Granted
- [ ] Test nhập OTP sai → Access Denied
- [ ] Test lịch sử truy cập hiển thị đúng

### 3. Chuẩn bị trình bày
- [ ] Slide giới thiệu dự án
- [ ] Demo script (theo flow dưới)
- [ ] Backup plan nếu có lỗi

## Script Demo (5-7 phút)

### Phần 1: Giới thiệu (1 phút)

**Nói:**
> "Chúng em xin trình bày dự án: Nghiên cứu, xây dựng mô hình xác thực 2FA ứng dụng RFID và vi điều khiển ESP32.
> 
> Hệ thống này kết hợp xác thực bằng thẻ RFID và mã OTP để tăng cường bảo mật trong kiểm soát truy cập."

**Hiển thị:**
- Slide tổng quan dự án
- Sơ đồ kiến trúc hệ thống

### Phần 2: Demo Mạch Wokwi (1-2 phút)

**Nói:**
> "Đây là mạch ESP32 được mô phỏng trên Wokwi, bao gồm:
> - ESP32 DevKit làm vi điều khiển chính
> - Module RC522 để đọc thẻ RFID
> - Màn hình LCD 16x2 hiển thị trạng thái
> - LED xanh/đỏ báo trạng thái
> - Relay module mô phỏng mở khóa
> - Buzzer phản hồi âm thanh"

**Thao tác:**
1. Mở mạch Wokwi (hoặc embed trong web app)
2. Giải thích các components
3. Chỉ ra các kết nối

### Phần 3: Demo Quy trình 2FA (3-4 phút)

**Bước 1: Quét thẻ RFID**

**Nói:**
> "Bây giờ em sẽ demo quy trình xác thực 2FA. Đầu tiên, quét thẻ RFID."

**Thao tác:**
1. Mở web app tại `http://localhost:3000`
2. Chọn thẻ RFID từ dropdown (ví dụ: A1B2C3D4 - Nguyễn Tiến Đạt)
3. Click "Quét thẻ"
4. **Giải thích:** "Hệ thống đã validate thẻ và tạo mã OTP 6 số"

**Bước 2: Nhận OTP**

**Nói:**
> "Mã OTP đã được gửi đến email của chủ thẻ. Trong môi trường production, OTP sẽ được gửi qua email. Hiện tại, OTP được hiển thị trong console log để demo."

**Thao tác:**
1. Chỉ vào terminal/console để hiển thị OTP
2. Hoặc kiểm tra email (nếu email service hoạt động)

**Bước 3: Nhập OTP**

**Nói:**
> "Bây giờ nhập mã OTP để hoàn tất xác thực."

**Thao tác:**
1. Nhập mã OTP vào form
2. Click "Xác thực OTP"
3. **Giải thích:** "Hệ thống đã verify OTP thành công. Nếu đây là mạch thật, ESP32 sẽ kích hoạt relay để mở khóa, LED xanh sáng, và buzzer kêu."

**Bước 4: Xem kết quả**

**Nói:**
> "Xác thực thành công! Hệ thống đã ghi lại log truy cập."

**Thao tác:**
1. Chỉ vào phần "Lịch sử truy cập"
2. Hiển thị log vừa tạo với status "Thành công"
3. Giải thích các thông tin: thời gian, UID, chủ thẻ, trạng thái

### Phần 4: Demo các tính năng khác (1 phút)

**Nói:**
> "Hệ thống còn có các tính năng:"

**Thao tác:**
1. **Filter lịch sử:** Click "Thành công" / "Thất bại" để filter
2. **Test OTP sai:** Nhập OTP sai để demo Access Denied
3. **Xem thẻ khác:** Chọn thẻ khác từ dropdown

### Phần 5: Kết luận (30 giây)

**Nói:**
> "Tóm lại, hệ thống đã thực hiện được:
> - Xác thực 2FA với RFID và OTP
> - Gửi OTP qua email
> - Ghi log truy cập
> - Mô phỏng phần cứng trên Wokwi
> 
> Cảm ơn thầy/cô và các bạn đã lắng nghe!"

## Backup Plan nếu có lỗi

### Nếu backend không chạy:
- Giải thích: "Trong môi trường production, backend sẽ chạy trên Render"
- Show code và giải thích logic

### Nếu email không gửi được:
- Giải thích: "OTP được hiển thị trong console log để demo"
- Chỉ vào terminal để show OTP

### Nếu Wokwi không load:
- Giải thích: "Mạch có thể được mở trong tab riêng"
- Hoặc show code ESP32 và giải thích logic

### Nếu frontend lỗi:
- Show code và giải thích cấu trúc
- Giải thích các components và API calls

## Câu hỏi thường gặp

**Q: Tại sao không dùng phần cứng thật?**
A: Do điều kiện không có phần cứng, chúng em sử dụng Wokwi để mô phỏng. Logic và quy trình hoàn toàn giống với phần cứng thật.

**Q: Email service hoạt động như thế nào?**
A: Sử dụng Gmail SMTP với App Password. Trong demo, OTP được log ra console để dễ theo dõi.

**Q: Bảo mật như thế nào?**
A: OTP có timeout 5 phút, chỉ sử dụng 1 lần. Thẻ RFID cần được đăng ký trước trong database.

**Q: Có thể mở rộng như thế nào?**
A: Có thể thêm nhiều thẻ, tích hợp với database thật, thêm webhook, hoặc kết nối với hệ thống quản lý tòa nhà.

## Checklist trước khi demo

- [ ] Test toàn bộ flow ít nhất 2 lần
- [ ] Chuẩn bị slide trình bày
- [ ] Backup code và database
- [ ] Chuẩn bị câu trả lời cho câu hỏi thường gặp
- [ ] Test internet connection (nếu demo online)
- [ ] Chuẩn bị backup plan

## Tips

1. **Nói rõ ràng:** Giải thích từng bước một cách chi tiết
2. **Tương tác:** Hỏi xem có câu hỏi gì không
3. **Show code:** Nếu có thời gian, show một số đoạn code quan trọng
4. **Nhấn mạnh điểm mạnh:** 2FA, mô phỏng phần cứng, web app đẹp
5. **Thành thật:** Nếu có hạn chế, nói rõ và giải thích lý do

Chúc demo thành công! 🎉

