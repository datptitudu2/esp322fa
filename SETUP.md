# Hướng dẫn Setup và Chạy

## Bước 1: Cài đặt Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Bước 2: Cấu hình Environment Variables

### Backend
1. Copy file `backend/env.example` thành `backend/.env`
2. Cập nhật các giá trị:
   - `EMAIL_USER`: Email Gmail của bạn
   - `EMAIL_PASS`: App Password của Gmail (không phải password thường)
   - `FRONTEND_URL`: URL frontend (http://localhost:3000 cho local)

**Lấy Gmail App Password:**
1. Vào Google Account Settings
2. Security → 2-Step Verification → App passwords
3. Tạo app password mới cho "Mail"
4. Copy password vào `.env`

### Frontend
1. Copy file `frontend/.env.local.example` thành `frontend/.env.local`
2. Cập nhật `NEXT_PUBLIC_API_URL` nếu backend chạy ở port khác

## Bước 3: Chạy Backend

```bash
cd backend
npm start
```

Backend sẽ chạy tại `http://localhost:3001`

## Bước 4: Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## Bước 5: Setup Wokwi Circuit

1. Truy cập https://wokwi.com và đăng nhập
2. Tạo project mới, chọn **ESP32 DevKit**
3. Thêm các components theo hướng dẫn trong `wokwi-circuit/README.md`
4. Copy code từ `wokwi-circuit/code.ino` vào Wokwi editor
5. Cập nhật trong code:
   - `ssid`: WiFi SSID
   - `password`: WiFi password
   - `apiUrl`: URL backend (sau khi deploy lên Render)

## Bước 6: Test

1. Mở frontend tại http://localhost:3000
2. Chọn một thẻ RFID từ dropdown
3. Click "Quét thẻ"
4. Kiểm tra email để lấy OTP
5. Nhập OTP vào form
6. Xem kết quả và lịch sử truy cập

## Deploy lên Render

### Backend
1. Push code lên GitHub
2. Tạo Web Service mới trên Render
3. Connect GitHub repo
4. Cấu hình:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment Variables: Copy từ `.env`
5. Lấy URL backend (ví dụ: `https://your-backend.onrender.com`)

### Frontend
1. Tạo Web Service mới trên Render
2. Connect cùng GitHub repo
3. Cấu hình:
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`
   - Environment Variables:
     - `NEXT_PUBLIC_API_URL`: URL backend trên Render
4. Lấy URL frontend

### Cập nhật ESP32 Code
1. Cập nhật `apiUrl` trong `code.ino` với URL backend trên Render
2. Upload lại code lên Wokwi

## Troubleshooting

### Backend không gửi được email
- Kiểm tra Gmail App Password đã đúng chưa
- Kiểm tra 2-Step Verification đã bật chưa
- Xem console log để biết OTP (trong development mode)

### Frontend không kết nối được backend
- Kiểm tra `NEXT_PUBLIC_API_URL` đã đúng chưa
- Kiểm tra CORS settings trong backend
- Kiểm tra backend đã chạy chưa

### ESP32 không kết nối được backend
- Kiểm tra WiFi credentials
- Kiểm tra backend URL đã đúng và accessible từ internet
- Kiểm tra backend đã deploy và chạy chưa

