# Quick Start - Tạo Mạch Wokwi Tự Động

## Cách 1: Import diagram.json (NHANH NHẤT - 2 phút)

### Bước 1: Tạo Project Mới
1. Truy cập [https://wokwi.com](https://wokwi.com)
2. Click **"New Project"** → Chọn **"ESP32 DevKit"**

### Bước 2: Import Diagram
1. Trong Wokwi editor, click vào tab **"diagram.json"** (bên cạnh sketch.ino)
2. Xóa toàn bộ nội dung hiện tại
3. Mở file `wokwi-circuit/diagram.json` trong project này
4. Copy **TOÀN BỘ** nội dung
5. Paste vào tab `diagram.json` trên Wokwi
6. **Lưu:** Click "SAVE" hoặc Ctrl+S

### Bước 3: Upload Code
1. Click tab **"sketch.ino"**
2. Xóa toàn bộ code hiện tại
3. Mở file `wokwi-circuit/code.ino` trong project này
4. Copy **TOÀN BỘ** code
5. Paste vào Wokwi editor
6. **Cập nhật:** Tìm và thay các dòng sau:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";        // Thay bằng WiFi của bạn
   const char* password = "YOUR_WIFI_PASSWORD"; // Thay bằng password WiFi
   const char* apiUrl = "http://your-backend-url.onrender.com/api/esp32";
   // Thay bằng URL backend (sau khi deploy) hoặc http://localhost:3001/api/esp32 để test local
   ```

### Bước 4: Chạy Simulation
1. Click nút **"Play"** (màu xanh) ở simulation area
2. Mạch sẽ tự động được tạo với tất cả components đã kết nối sẵn!

## Cách 2: Tạo Thủ Công (Nếu import không được)

Nếu cách 1 không hoạt động, làm theo [SETUP_WOKWI.md](SETUP_WOKWI.md) để kết nối thủ công.

## Lấy URL để Nhúng vào Web App

1. Sau khi mạch đã chạy, click nút **"Share"** (góc trên bên phải)
2. Copy URL (ví dụ: `https://wokwi.com/projects/400780875479811073`)
3. Dán vào web app:
   - Cách 1: Nhập trực tiếp trong UI (ở phần "Mạch ESP32 trên Wokwi")
   - Cách 2: Thêm vào `frontend/.env.local`:
     ```
     NEXT_PUBLIC_WOKWI_URL=https://wokwi.com/projects/YOUR_PROJECT_ID
     ```

## Test

1. Mạch sẽ tự động có:
   - ✅ ESP32 DevKit
   - ✅ RC522 RFID Reader (đã kết nối SPI)
   - ✅ LCD 16x2 I2C (đã kết nối I2C)
   - ✅ LED xanh (GPIO 2)
   - ✅ LED đỏ (GPIO 4)
   - ✅ Relay Module (GPIO 18)
   - ✅ Buzzer (GPIO 19)

2. Click "Play" → Mạch sẽ chạy simulation
3. Trong Wokwi, bạn có thể "quét thẻ" bằng cách:
   - Click vào RC522 reader
   - Chọn "Scan Card"
   - Chọn một thẻ RFID mẫu

## Troubleshooting

### Diagram không import được
- Đảm bảo copy đúng toàn bộ nội dung từ `diagram.json`
- Kiểm tra JSON syntax (không có lỗi)
- Thử refresh trang và import lại

### Components không hiển thị
- Đảm bảo đã save diagram.json
- Thử click "Play" để simulation load lại
- Nếu vẫn không được, làm theo cách 2 (thủ công)

### Code không compile
- Kiểm tra libraries đã được cài đặt chưa
- Wokwi sẽ tự động cài libraries khi compile
- Xem error messages trong console

---

**Tổng thời gian:** ~2-3 phút nếu dùng cách 1 (import diagram.json)

