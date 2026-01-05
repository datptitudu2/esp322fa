# Vấn đề Database trên Render Free Tier

## ⚠️ Vấn đề

**Render free tier không có persistent file system:**
- File `db.json` sẽ bị reset mỗi lần service restart
- Logs từ ESP32 có thể đã được lưu nhưng mất khi service restart
- Database chỉ tồn tại trong memory, không persist

## 🔍 Kiểm tra

1. **ESP32 gửi log thành công:**
   - `>>> ✓✓✓ Log da duoc gui len server thanh cong!`
   - Backend trả về: `{"success":true,"message":"Log saved"}`

2. **Nhưng frontend không thấy log:**
   - Có thể do service đã restart → Database reset
   - Hoặc frontend đang gọi localhost thay vì Render backend

## ✅ Giải pháp tạm thời

### Option 1: Test ngay sau khi ESP32 gửi log
- ESP32 gửi log → Kiểm tra frontend ngay (trước khi service restart)
- Logs sẽ có trong vài phút đầu

### Option 2: Upgrade lên Starter Plan
- Render Starter plan có persistent storage
- Database sẽ không bị reset khi restart
- Cost: ~$7/tháng

### Option 3: Dùng Render PostgreSQL (Free)
1. Tạo PostgreSQL database trên Render (free tier)
2. Update backend code để dùng PostgreSQL thay vì JSON file
3. Database sẽ persist ngay cả khi service restart

## 🎯 Khuyến nghị cho Demo

**Cho demo ngày mai:**
- Dùng Option 1: Test ngay sau khi ESP32 gửi log
- Hoặc verify OTP trên web app → Log sẽ được ghi và hiển thị ngay

**Cho production:**
- Dùng Option 3: Render PostgreSQL (free, persistent)

