# Sửa Frontend Environment Variable trên Render

## ❌ Vấn đề

Frontend trên Render (`https://esp32fa1.onrender.com`) vẫn đang gọi `http://localhost:3001` thay vì Render backend.

## ✅ Giải pháp

### Bước 1: Kiểm tra Environment Variable

1. Vào Render Dashboard
2. Chọn Frontend service (`esp32fa1`)
3. Vào tab **"Environment"**
4. Kiểm tra có biến:
   - `NEXT_PUBLIC_API_URL` = `https://esp322fa.onrender.com`

### Bước 2: Thêm/Cập nhật Environment Variable

Nếu chưa có hoặc sai:

1. Click **"+ Add Environment Variable"**
2. Thêm:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://esp322fa.onrender.com`
3. Click **"Save Changes"**

### Bước 3: Redeploy Frontend

Sau khi save env variable:
- Render sẽ tự động redeploy
- Hoặc click **"Manual Deploy"** → **"Deploy latest commit"**

### Bước 4: Kiểm tra

1. Mở URL frontend: `https://esp32fa1.onrender.com`
2. Mở Console (F12)
3. Kiểm tra Network tab:
   - ✅ Phải thấy requests đến: `https://esp322fa.onrender.com/api/access/logs`
   - ❌ KHÔNG được thấy: `http://localhost:3001/api/access/logs`

## ⚠️ Vấn đề Database trên Render Free Tier

**Render free tier không có persistent file system:**
- File `db.json` sẽ bị reset mỗi lần service restart
- Logs từ ESP32 có thể đã được lưu nhưng mất khi service restart

**Giải pháp:**
1. **Test ngay sau khi ESP32 gửi log** (trước khi service restart)
2. **Upgrade lên Starter plan** (có persistent storage)
3. **Dùng Render PostgreSQL** (free tier có persistent database)

## 🎯 Kết quả mong đợi

Sau khi fix env variable và redeploy:
- ✅ Frontend gọi đúng Render backend
- ✅ Logs từ ESP32 sẽ xuất hiện (nếu service chưa restart)
- ✅ Không còn CORS errors

