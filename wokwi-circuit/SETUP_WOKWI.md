# Hướng dẫn Setup Mạch Wokwi Chi Tiết

## Bước 1: Tạo Project trên Wokwi

1. Truy cập [https://wokwi.com](https://wokwi.com)
2. Đăng nhập hoặc tạo tài khoản (miễn phí)
3. Click **"New Project"** → Chọn **"ESP32 DevKit"**

## Bước 2: Thêm Components

Trong Wokwi editor, thêm các components sau:

### Components cần thiết:
1. **ESP32 DevKit V1** (đã có sẵn)
2. **MFRC522 RFID Reader** - Tìm trong Library Manager: `MFRC522`
3. **LCD 16x2 I2C** - Tìm: `LiquidCrystal I2C`
4. **LED xanh** - Tìm: `LED` (chọn màu green)
5. **LED đỏ** - Tìm: `LED` (chọn màu red)
6. **Relay Module** - Tìm: `Relay`
7. **Buzzer** - Tìm: `Buzzer`

### Cách thêm:
- Click nút **"+"** ở góc trên bên phải simulation area
- Tìm và click vào component cần thêm
- Component sẽ xuất hiện trên breadboard

## Bước 3: Kết nối Mạch

Kết nối các components theo sơ đồ sau:

### RC522 RFID Reader (SPI):
```
RC522 SDA  → ESP32 GPIO 5
RC522 SCK  → ESP32 GPIO 18
RC522 MOSI → ESP32 GPIO 23
RC522 MISO → ESP32 GPIO 19
RC522 RST  → ESP32 GPIO 22
RC522 3.3V → ESP32 3.3V
RC522 GND  → ESP32 GND
```

### LCD 16x2 I2C:
```
LCD SDA → ESP32 GPIO 21
LCD SCL → ESP32 GPIO 22
LCD VCC → ESP32 5V
LCD GND → ESP32 GND
```

**Lưu ý:** LCD I2C và RC522 có thể dùng chung SDA/SCL nếu cùng I2C bus, nhưng trong code này ta dùng SPI cho RC522 nên không conflict.

### LEDs:
```
LED xanh (anode) → ESP32 GPIO 2
LED xanh (cathode) → GND (qua resistor 220Ω)
LED đỏ (anode) → ESP32 GPIO 4
LED đỏ (cathode) → GND (qua resistor 220Ω)
```

### Relay Module:
```
Relay IN  → ESP32 GPIO 18
Relay VCC → ESP32 5V
Relay GND → ESP32 GND
```

### Buzzer:
```
Buzzer + → ESP32 GPIO 19
Buzzer - → GND
```

## Bước 4: Upload Code

1. Mở file `code.ino` trong project này
2. Copy toàn bộ code
3. Paste vào Wokwi editor (file `sketch.ino`)
4. **Quan trọng:** Cập nhật các thông tin sau trong code:

```cpp
// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";        // Thay bằng WiFi của bạn
const char* password = "YOUR_WIFI_PASSWORD"; // Thay bằng password WiFi

// Backend API URL
const char* apiUrl = "http://your-backend-url.onrender.com/api/esp32";
// Thay bằng URL backend sau khi deploy lên Render
```

## Bước 5: Cài đặt Libraries

Trong Wokwi, các libraries sẽ tự động được cài đặt khi bạn include. Đảm bảo code có:

```cpp
#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>
```

Nếu thiếu, Wokwi sẽ tự động cài đặt khi bạn compile.

## Bước 6: Test Local (Optional)

Nếu muốn test local trước khi deploy:

1. Thay `apiUrl` thành: `"http://localhost:3001/api/esp32"`
2. **Lưu ý:** Wokwi simulation không thể kết nối đến localhost, chỉ có thể kết nối đến internet
3. Để test local, bạn cần:
   - Deploy backend lên Render trước
   - Hoặc dùng ngrok để expose localhost

## Bước 7: Chạy Simulation

1. Click nút **"Play"** (màu xanh) ở simulation area
2. Xem Serial Monitor để debug
3. Trong Wokwi, bạn có thể "quét thẻ" bằng cách:
   - Click vào RC522 reader
   - Chọn "Scan Card"
   - Chọn một thẻ RFID mẫu

## Bước 8: Lấy Wokwi URL để Embed

1. Click nút **"Share"** ở Wokwi
2. Copy URL (ví dụ: `https://wokwi.com/projects/xxxxx`)
3. Cập nhật URL này vào `frontend/components/WokwiEmbed.tsx`:

```tsx
const wokwiUrl = url || 'https://wokwi.com/projects/YOUR_PROJECT_ID';
```

## Troubleshooting

### LCD không hiển thị
- Kiểm tra I2C address (thử 0x27 hoặc 0x3F)
- Kiểm tra kết nối SDA/SCL

### RFID không đọc được thẻ
- Kiểm tra kết nối SPI
- Đảm bảo RST pin đã kết nối
- Thử reset ESP32

### WiFi không kết nối
- Kiểm tra SSID và password
- Trong Wokwi, WiFi có thể không hoạt động thực tế
- Có thể cần mock WiFi cho simulation

### Backend không phản hồi
- Kiểm tra URL backend đã đúng chưa
- Đảm bảo backend đã deploy và accessible từ internet
- Kiểm tra CORS settings trong backend

## Lưu ý cho Demo

- **Wokwi Simulation:** Có thể chạy độc lập để demo mạch
- **Web App:** Có thể demo luồng 2FA mà không cần mạch thật
- **Kết hợp:** Embed Wokwi vào web app để demo toàn bộ hệ thống

## Tham khảo

- [Wokwi Documentation](https://docs.wokwi.com/)
- [ESP32 Pinout](https://docs.wokwi.com/parts/wokwi-esp32-devkit-v1)
- [MFRC522 Library](https://github.com/miguelbalboa/rfid)

