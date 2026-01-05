# Quick Guide: Deploy Frontend lên Render

## 🚀 Các bước nhanh

### 1. Tạo Web Service mới
- Vào Render Dashboard → "New +" → "Web Service"
- Connect repo: `datptitudu2/esp322fa`

### 2. Cấu hình

**Thông tin:**
- Name: `esp322fa-frontend`
- Environment: `Node`
- Region: `Singapore` (giống backend)
- Branch: `main`

**Build Settings:**
- **Root Directory:** `frontend` ⭐
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://esp322fa.onrender.com
NODE_ENV=production
```

### 3. Deploy
- Click "Create Web Service"
- Đợi 5-10 phút
- Lấy URL frontend (ví dụ: `https://esp322fa-frontend.onrender.com`)

### 4. Cập nhật Backend CORS

Sau khi có URL frontend:

1. Vào Backend service (`esp322fa`) trên Render
2. Tab "Environment"
3. Cập nhật:
   - `FRONTEND_URL` = URL frontend mới
   - `CORS_ORIGIN` = URL frontend mới
4. Save → Backend tự động redeploy

## ✅ Kết quả

- ✅ Frontend: `https://esp322fa-frontend.onrender.com`
- ✅ Backend: `https://esp322fa.onrender.com`
- ✅ Không còn conflict với localhost
- ✅ Tất cả trên cloud!

## 🎯 Test

1. Mở URL frontend
2. Console (F12): `🔗 API URL: https://esp322fa.onrender.com`
3. Test quét thẻ → Logs xuất hiện!

