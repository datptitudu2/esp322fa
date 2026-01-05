# Deploy Frontend lên Render

## Bước 1: Tạo Web Service mới trên Render

⚠️ **QUAN TRỌNG:** Phải chọn **"Web Service"** (KHÔNG phải "Static Site")!

1. Vào [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"** ⭐ (KHÔNG chọn Static Site!)
3. Connect GitHub repository: `datptitudu2/esp322fa`
4. Chọn repository

**Lưu ý:** 
- Next.js cần Node.js runtime → Phải dùng **Web Service**
- Static Site chỉ cho static files, không chạy được Next.js server

## Bước 2: Cấu hình Frontend Service

### Thông tin cơ bản:
- **Name:** `esp322fa-frontend` (hoặc tên bạn muốn)
- **Environment:** `Node`
- **Region:** Singapore (Southeast Asia) - giống backend
- **Branch:** `main`

### Build Settings:
- **Root Directory:** `frontend` ⭐ (QUAN TRỌNG!)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free

### Environment Variables:

Thêm các biến môi trường sau:

| Key | Value | Mô tả |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://esp322fa.onrender.com` | URL backend đã deploy |
| `NODE_ENV` | `production` | Môi trường production |

**Lưu ý:** 
- `NEXT_PUBLIC_API_URL` phải trỏ đến backend Render: `https://esp322fa.onrender.com`
- Không có dấu `/` ở cuối

## Bước 3: Deploy

1. Click **"Create Web Service"**
2. Đợi build và deploy (5-10 phút)
3. Lấy URL frontend (ví dụ: `https://esp322fa-frontend.onrender.com`)

## Bước 4: Cập nhật Backend CORS

Sau khi có URL frontend:

1. Vào Backend service trên Render (`esp322fa`)
2. Vào tab **"Environment"**
3. Cập nhật các biến:
   - `FRONTEND_URL` = URL frontend vừa deploy (ví dụ: `https://esp322fa-frontend.onrender.com`)
   - `CORS_ORIGIN` = URL frontend vừa deploy
4. Click **"Save Changes"** → Render sẽ tự động redeploy backend

## Bước 5: Test

1. Mở URL frontend trên browser
2. Kiểm tra Console (F12):
   - ✅ Phải thấy: `🔗 API URL: https://esp322fa.onrender.com`
   - ✅ Không có CORS errors
3. Test quét thẻ RFID
4. Kiểm tra logs xuất hiện

## ✅ Kết quả

Sau khi deploy:
- ✅ Frontend có URL public: `https://esp322fa-frontend.onrender.com`
- ✅ Không còn conflict với localhost
- ✅ ESP32 và Frontend đều kết nối đến Render backend
- ✅ Tất cả hoạt động trên cloud, không cần localhost

## 🎯 Lợi ích

1. **Không còn conflict:** Không cần chạy localhost nữa
2. **Dễ demo:** Có URL public, demo ở đâu cũng được
3. **Ổn định:** Tất cả trên cloud, không phụ thuộc máy local
4. **Dễ share:** Có thể share URL cho người khác test

