# Hướng dẫn Test Deploy và ESP32 Connection

## Bước 1: Deploy Backend lên Render

1. Push code lên GitHub (nếu chưa có)
2. Tạo Web Service trên Render:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     - `PORT=10000` (Render tự động set, nhưng có thể override)
     - `NODE_ENV=production`
     - `FRONTEND_URL=*` (tạm thời để test)
     - `EMAIL_USER=dattkdz@gmail.com`
     - `EMAIL_PASS=Itfrbzoxxykugfqt`

3. Đợi deploy xong, lấy URL backend (ví dụ: `https://2fa-rfid-backend.onrender.com`)

## Bước 2: Test Backend API

### Test Health Check:
```bash
curl https://your-backend.onrender.com/api/health
```
Kết quả mong đợi: `{"status":"ok","timestamp":"..."}`

### Test Log Access Endpoint:
```bash
curl -X POST https://your-backend.onrender.com/api/esp32/log-access \
  -H "Content-Type: application/json" \
  -d '{
    "rfid_uid": "E5F6G7H8",
    "user_name": "NGUYEN SI DUY",
    "success": true,
    "timestamp": "2025-12-02T12:00:00"
  }'
```

Kết quả mong đợi: `{"success":true,"message":"Log saved"}`

## Bước 3: Cập nhật ESP32 Code

1. Mở file `wokwi-circuit/code.ino`
2. Tìm dòng 39:
   ```cpp
   const char* serverURL = "http://localhost:3001";
   ```
3. Thay bằng URL backend Render:
   ```cpp
   const char* serverURL = "https://your-backend.onrender.com";
   ```
   **LƯU Ý:** Dùng `https://` không phải `http://`

4. Upload lại code lên Wokwi

## Bước 4: Test ESP32 Connection

1. Mở Wokwi circuit
2. Nhập RFID UID vào Serial Monitor: `E5F6G7H8`
3. Nhập OTP code
4. Kiểm tra Serial Monitor:
   - Nếu thấy: `>>> ✓✓✓ Log da duoc gui len server thanh cong!` → **THÀNH CÔNG!**
   - Nếu thấy: `>>> ⚠️ Khong gui duoc log...` → Kiểm tra lại URL và CORS

## Bước 5: Verify Log trên Web App

1. Mở web app (local hoặc deploy)
2. Kiểm tra "Lịch sử truy cập"
3. Log từ ESP32 sẽ xuất hiện sau khi verify OTP thành công

## Troubleshooting

### ESP32 không kết nối được:
1. **Kiểm tra URL:** Đảm bảo dùng `https://` không phải `http://`
2. **Kiểm tra CORS:** Backend phải cho phép tất cả origins (`origin: '*'`)
3. **Kiểm tra Backend:** Test bằng curl trước
4. **Kiểm tra WiFi:** ESP32 trong Wokwi tự động kết nối `Wokwi-GUEST`

### Log không xuất hiện trên web app:
1. **Kiểm tra refresh:** Web app refresh mỗi 2 giây
2. **Kiểm tra backend logs:** Xem Render logs để debug
3. **Kiểm tra database:** Log có được ghi vào `db.json` không

## Kết luận

✅ **CÓ THỂ GỬI LOG TỪ ESP32 VỀ BACKEND** sau khi deploy, vì:
- Wokwi có thể kết nối đến URL public (Render)
- CORS đã cấu hình cho phép tất cả origins
- Endpoint đã sẵn sàng và hoạt động

🎯 **Khuyến nghị:** Test local trước (verify OTP trên web app), sau đó deploy để có full integration.

