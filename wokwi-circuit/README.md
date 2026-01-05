# ESP32 2FA RFID Circuit trên Wokwi

## Hướng dẫn setup

1. Truy cập [Wokwi.com](https://wokwi.com) và đăng nhập
2. Tạo project mới, chọn **ESP32 DevKit**
3. Thêm các components sau:

### Components cần thiết:
- **ESP32 DevKit V1**
- **RC522 RFID Reader** (MFRC522)
- **LCD 16x2 I2C** (LiquidCrystal_I2C)
- **LED xanh** (Green LED)
- **LED đỏ** (Red LED)
- **Relay Module** (5V Relay)
- **Buzzer** (Passive Buzzer)

### Kết nối mạch:

#### RC522 (SPI):
- SDA → GPIO 5
- SCK → GPIO 18
- MOSI → GPIO 23
- MISO → GPIO 19
- RST → GPIO 22
- 3.3V → 3.3V
- GND → GND

#### LCD I2C:
- SDA → GPIO 21
- SCL → GPIO 22
- VCC → 5V
- GND → GND

#### LEDs:
- LED xanh → GPIO 2
- LED đỏ → GPIO 4

#### Relay:
- IN → GPIO 18
- VCC → 5V
- GND → GND

#### Buzzer:
- Positive → GPIO 19
- Negative → GND

4. Copy code từ `code.ino` vào Wokwi editor
5. Cập nhật các thông tin:
   - WiFi SSID và Password
   - Backend API URL (URL của backend trên Render)
6. Chạy simulation và test

## Lưu ý:

- Trong môi trường Wokwi, WiFi có thể không hoạt động thực tế
- Có thể cần điều chỉnh code để test local hoặc sử dụng mock data
- Backend API phải được deploy và accessible từ internet

