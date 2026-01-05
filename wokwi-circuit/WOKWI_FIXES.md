# Các Sửa Đổi Cần Thiết Cho Wokwi Project

## ✅ Đã Sửa Trong Backend

Backend đã được cập nhật với các API endpoints mới để tương thích với code Wokwi của bạn:

1. **POST `/api/esp32/verify-rfid`** - Tương thích với code Wokwi
   - Nhận `rfid_uid` trong body
   - Trả về `otp_code`, `email_sent`, `user_name`, etc.

2. **POST `/api/esp32/log-access`** - Để log access từ ESP32
   - Nhận `rfid_uid`, `user_name`, `success`, `timestamp`
   - Ghi log vào database

## ⚠️ Cần Sửa Trong Code Wokwi (2 chỗ)

### 1. Cập nhật Server URL

Trong code Wokwi, tìm dòng:
```cpp
const char* serverURL = "http://localhost:5000";
```

**Sửa thành:**
```cpp
const char* serverURL = "http://localhost:3001";  // Port của backend
// Hoặc nếu deploy: "https://your-backend.onrender.com"
```

### 2. API Endpoint (Đã Đúng!)

Code Wokwi đã gọi đúng `/api/verify-rfid` - Backend đã được cập nhật để hỗ trợ endpoint này. **Không cần sửa!**

## ✅ Code Khác Đã Đúng

- ✅ `sendLogToServer()` đã gọi đúng `/api/esp32/log-access`
- ✅ Parse response đã đúng format
- ✅ Database cards đã khớp với backend

## 📝 Checklist

- [ ] Sửa `serverURL` từ `localhost:5000` → `localhost:3001`
- [ ] Sửa endpoint `/api/verify-rfid` → `/api/esp32/verify-rfid`
- [ ] Test kết nối với backend
- [ ] Test quét thẻ và nhận OTP
- [ ] Test nhập OTP và verify

## 🔗 Test

Sau khi sửa, test bằng cách:

1. Chạy backend: `cd backend && npm start`
2. Trong Wokwi Serial Monitor, nhập: `A1B2C3D4`
3. Kiểm tra response có `otp_code` không
4. Nhập OTP code để verify

## 📌 Lưu ý

- Backend chạy trên port **3001** (không phải 5000)
- API endpoint là `/api/esp32/verify-rfid` (không phải `/api/verify-rfid`)
- Email có thể không gửi được, nhưng OTP sẽ được trả về trong response để hiển thị trên OLED

