# Sửa lỗi Frontend Deploy trên Render

## ❌ Vấn đề hiện tại

Render đang detect frontend là **Static Site** thay vì **Web Service**, dẫn đến lỗi:
- `Publish directory npm start does not exist!`
- Build failed

## ✅ Giải pháp

### Cách 1: Xóa và tạo lại Web Service (Khuyến nghị)

1. **Xóa Static Site hiện tại:**
   - Vào Render Dashboard
   - Tìm service `esp32` (Static Site)
   - Vào Settings → Scroll xuống → Click "Delete"
   - Xác nhận xóa

2. **Tạo Web Service mới:**
   - Click "New +" → **"Web Service"** (KHÔNG phải Static Site!)
   - Connect repo: `datptitudu2/esp322fa`
   - Chọn branch: `main`

3. **Cấu hình:**
   - **Name:** `esp322fa-frontend`
   - **Environment:** `Node`
   - **Region:** `Singapore`
   - **Root Directory:** `frontend` ⭐
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://esp322fa.onrender.com
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Đợi build (5-10 phút)

### Cách 2: Sửa Static Site thành Web Service (Nếu có option)

1. Vào Settings của service `esp32`
2. Tìm option "Service Type" hoặc "Convert to Web Service"
3. Nếu không có, phải xóa và tạo lại (Cách 1)

## ⚠️ Lưu ý quan trọng

- **KHÔNG chọn "Static Site"** - Chọn **"Web Service"**
- Next.js cần Node.js runtime, không phải static hosting
- Static Site chỉ dùng cho static HTML/CSS/JS, không chạy được Next.js server

## ✅ Sau khi deploy thành công

1. Lấy URL frontend (ví dụ: `https://esp322fa-frontend.onrender.com`)
2. Cập nhật Backend CORS:
   - Vào Backend service (`esp322fa`)
   - Environment tab
   - Cập nhật:
     - `FRONTEND_URL` = URL frontend mới
     - `CORS_ORIGIN` = URL frontend mới
   - Save → Backend tự động redeploy

## 🎯 Kết quả

- ✅ Frontend chạy trên Web Service (Node.js)
- ✅ Next.js server hoạt động đúng
- ✅ API calls đến Render backend thành công
- ✅ Không còn conflict với localhost

