# Các Sửa Đổi Cần Thiết Cho Wokwi Project

## ✅ Đã Sửa Trong Backend

Backend đã được cập nhật với 2 API endpoints mới để tương thích với code Wokwi:

1. **POST `/api/esp32/verify-rfid`** - Thay thế cho `/api/verify-rfid`
   - Nhận `rfid_uid` trong body
   - Trả về `otp_code`, `email_sent`, `user_name`, etc.

2. **POST `/api/esp32/log-access`** - Để log access từ ESP32
   - Nhận `rfid_uid`, `user_name`, `success`, `timestamp`
   - Ghi log vào database

## ⚠️ Cần Sửa Trong Code Wokwi

### 1. Cập nhật API URL

Trong code Wokwi, tìm dòng:
```cpp
const char* serverURL = "http://localhost:5000";
```

Sửa thành:
```cpp
const char* serverURL = "http://localhost:3001";  // Hoặc URL backend trên Render
```

### 2. Cập nhật API Endpoints

Tìm hàm `sendOTPToEmail()`, sửa:
```cpp
// CŨ:
String url = String(serverURL) + "/api/verify-rfid";

// MỚI:
String url = String(serverURL) + "/api/esp32/verify-rfid";
```

Tìm hàm `sendLogToServer()`, sửa:
```cpp
// CŨ:
String url = String(serverURL) + "/api/esp32/log-access";

// MỚI: (giữ nguyên, đã đúng)
String url = String(serverURL) + "/api/esp32/log-access";
```

### 3. Cập nhật Parse Response

Trong hàm `sendOTPToEmail()`, response format đã thay đổi:
```cpp
// Response format mới:
{
  "success": true,
  "email_sent": true,
  "otp_code": "123456",
  "card_id": "1",
  "user_name": "Nguyễn Tiến Đạt",
  "user_email": "dattkdz@gmail.com"
}
```

Cập nhật code parse:
```cpp
if (response.indexOf("\"success\":true") > 0) {
  // Parse OTP
  int otpStart = response.indexOf("\"otp_code\":\"") + 12;
  int otpEnd = response.indexOf("\"", otpStart);
  if (otpStart > 11 && otpEnd > otpStart) {
    String serverOTP = response.substring(otpStart, otpEnd);
    currentOTPCode = serverOTP;
  }
  
  // Check email status
  if (response.indexOf("\"email_sent\":true") > 0) {
    Serial.println(">>> ✓ OTP da duoc gui den email!");
  } else {
    Serial.println(">>> ⚠️ Email khong duoc gui - Su dung OTP: " + currentOTPCode);
  }
}
```

### 4. (Optional) Thêm Đọc RFID Thật

Nếu muốn đọc RFID thật từ RC522 thay vì nhập Serial:

1. Thêm vào đầu file:
```cpp
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22
MFRC522 mfrc522(SS_PIN, RST_PIN);
```

2. Trong `setup()`:
```cpp
SPI.begin();
mfrc522.PCD_Init();
```

3. Trong `loop()`, thêm trước phần đọc Serial:
```cpp
// Đọc RFID thật
if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  if (uid != currentRFID && (millis() - lastCardRead > 2000)) {
    currentRFID = uid;
    lastCardRead = millis();
    Serial.println("\n>>> RFID Card: " + currentRFID);
    handleRFIDCard(currentRFID);
  }
  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
```

## 📝 Checklist

- [ ] Cập nhật `serverURL` trong code Wokwi
- [ ] Sửa API endpoint `/api/verify-rfid` → `/api/esp32/verify-rfid`
- [ ] Cập nhật parse response trong `sendOTPToEmail()`
- [ ] Test kết nối với backend
- [ ] (Optional) Thêm đọc RFID thật từ RC522

## 🔗 Links

- Wokwi Project: https://wokwi.com/projects/449149677665971201
- Backend API: http://localhost:3001/api/esp32

