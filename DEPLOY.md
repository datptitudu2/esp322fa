# Hướng dẫn Deploy lên Render

## Chuẩn bị

1. **Push code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 2FA RFID ESP32 System"
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **Đảm bảo không commit file nhạy cảm:**
   - File `.env` đã có trong `.gitignore`
   - File `backend/database/db.json` đã có trong `.gitignore`

## Deploy Backend

### Bước 1: Tạo Web Service

1. Đăng nhập [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Chọn repository của bạn

### Bước 2: Cấu hình Backend Service

**Name:** `2fa-rfid-backend` (hoặc tên bạn muốn)

**Environment:** `Node`

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

**Plan:** Free (hoặc Starter nếu cần)

### Bước 3: Environment Variables

Thêm các biến môi trường sau:

| Key | Value | Mô tả |
|-----|-------|-------|
| `NODE_ENV` | `production` | Môi trường production |
| `PORT` | `10000` | Port (Render sẽ tự động set, nhưng có thể override) |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | URL frontend (sẽ cập nhật sau) |
| `CORS_ORIGIN` | `https://your-frontend.onrender.com` | CORS origin |
| `EMAIL_USER` | `dattkdz@gmail.com` | Gmail để gửi OTP |
| `EMAIL_PASS` | `Itfrbzoxxykugfqt` | Gmail App Password |

**Lưu ý:** 
- `FRONTEND_URL` và `CORS_ORIGIN` sẽ cập nhật sau khi deploy frontend
- Tạm thời có thể để `*` để test

### Bước 4: Deploy

1. Click **"Create Web Service"**
2. Đợi build và deploy (5-10 phút)
3. Lấy URL backend (ví dụ: `https://2fa-rfid-backend.onrender.com`)

## Deploy Frontend

### Bước 1: Tạo Web Service mới

1. Click **"New +"** → **"Web Service"**
2. Connect cùng GitHub repository

### Bước 2: Cấu hình Frontend Service

**Name:** `2fa-rfid-frontend`

**Environment:** `Node`

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Start Command:**
```bash
cd frontend && npm start
```

**Plan:** Free

### Bước 3: Environment Variables

| Key | Value | Mô tả |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | URL backend vừa deploy |

**Lưu ý:** Thay `your-backend.onrender.com` bằng URL backend thực tế

### Bước 4: Deploy

1. Click **"Create Web Service"**
2. Đợi build và deploy
3. Lấy URL frontend

### Bước 5: Cập nhật Backend CORS

1. Quay lại Backend service trên Render
2. Vào **Environment** tab
3. Cập nhật:
   - `FRONTEND_URL` = URL frontend vừa deploy
   - `CORS_ORIGIN` = URL frontend vừa deploy
4. Click **"Save Changes"** → Render sẽ tự động redeploy

## Cập nhật ESP32 Code

1. Mở file `wokwi-circuit/code.ino`
2. Tìm dòng:
   ```cpp
   const char* apiUrl = "http://your-backend-url.onrender.com/api/esp32";
   ```
3. Thay bằng URL backend thực tế:
   ```cpp
   const char* apiUrl = "https://your-backend.onrender.com/api/esp32";
   ```
   **Lưu ý:** Dùng `https://` không phải `http://`

4. Upload lại code lên Wokwi

## Cập nhật Frontend Wokwi URL

1. Mở file `frontend/components/WokwiEmbed.tsx`
2. Cập nhật Wokwi project URL nếu có

## Test sau khi Deploy

### Test Backend:
```bash
curl https://your-backend.onrender.com/api/health
```
Kết quả mong đợi: `{"status":"ok","timestamp":"..."}`

### Test Frontend:
1. Mở URL frontend trên browser
2. Test quét thẻ RFID
3. Kiểm tra OTP được gửi
4. Test verify OTP

### Test ESP32 (trên Wokwi):
1. Mở mạch Wokwi
2. Chạy simulation
3. "Quét thẻ" RFID
4. Kiểm tra ESP32 gọi được backend API

## Troubleshooting

### Backend không start được
- Kiểm tra build command đã đúng chưa
- Kiểm tra `package.json` có script `start` không
- Xem logs trong Render dashboard

### Frontend build failed
- Kiểm tra TypeScript errors
- Kiểm tra dependencies đã đầy đủ chưa
- Xem build logs

### CORS errors
- Đảm bảo `CORS_ORIGIN` trong backend đã đúng URL frontend
- Kiểm tra `FRONTEND_URL` đã đúng chưa

### Email không gửi được
- Kiểm tra Gmail App Password đã đúng chưa
- Kiểm tra 2-Step Verification đã bật
- Xem logs trong Render để debug

### ESP32 không kết nối được backend
- Đảm bảo URL backend dùng `https://` không phải `http://`
- Kiểm tra backend đã accessible từ internet
- Test bằng cách mở URL backend trên browser

## Lưu ý Render Free Tier

- **Sleep sau 15 phút không dùng:** Service sẽ sleep, lần đầu truy cập sẽ mất 30-60 giây để wake up
- **Build time limit:** 90 phút
- **Bandwidth:** 100GB/tháng
- **Để tránh sleep:** Có thể dùng uptime monitoring service (như UptimeRobot)

## Tối ưu Performance

1. **Database:** Có thể nâng cấp lên SQLite hoặc PostgreSQL (Render có free PostgreSQL)
2. **Caching:** Thêm caching cho OTP sessions
3. **Rate limiting:** Thêm rate limiting để tránh abuse
4. **Monitoring:** Thêm logging và monitoring

## Backup

- **Database:** Backup file `db.json` định kỳ
- **Environment variables:** Lưu lại tất cả env vars
- **Code:** Đã có trên GitHub

## Rollback

Nếu có vấn đề, có thể rollback:
1. Vào Render dashboard
2. Chọn service
3. Vào **"Manual Deploy"** tab
4. Chọn commit cũ và deploy lại

Chúc deploy thành công! 🚀

