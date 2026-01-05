# Hướng dẫn Restart Frontend để load .env.local

## ⚠️ QUAN TRỌNG: Next.js chỉ load .env.local khi khởi động

## Các bước bắt buộc:

### 1. Dừng Frontend hoàn toàn
- Tìm terminal đang chạy `npm run dev`
- Nhấn `Ctrl + C` để dừng
- Đảm bảo process đã dừng hoàn toàn

### 2. Xóa cache Next.js (đã tự động xóa)
```bash
cd frontend
# .next folder đã được xóa
```

### 3. Restart Frontend
```bash
cd frontend
npm run dev
```

### 4. Hard Refresh Browser
- Nhấn `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- Hoặc: F12 → Right click Refresh → "Empty Cache and Hard Reload"

### 5. Kiểm tra Browser Console
Mở Console (F12) và kiểm tra:
- ✅ Phải thấy: `🔗 API URL: https://esp322fa.onrender.com`
- ❌ KHÔNG được thấy: `🔗 API URL: http://localhost:3001`

### 6. Kiểm tra Network Tab
- Mở Network tab (F12)
- Refresh page
- Tìm request đến `/api/access/logs`
- ✅ Phải thấy: `https://esp322fa.onrender.com/api/access/logs`
- ❌ KHÔNG được thấy: `http://localhost:3001/api/access/logs`

## Nếu vẫn thấy localhost:3001

1. **Kiểm tra file .env.local:**
   ```bash
   cd frontend
   cat .env.local
   # Phải thấy: NEXT_PUBLIC_API_URL=https://esp322fa.onrender.com
   ```

2. **Kiểm tra không có file .env khác:**
   ```bash
   cd frontend
   ls -la .env*
   # Chỉ nên có .env.local
   ```

3. **Restart lại từ đầu:**
   - Dừng hoàn toàn
   - Xóa .next folder
   - Restart

## ✅ Kết quả mong đợi

Sau khi restart đúng cách:
- Browser Console: `🔗 API URL: https://esp322fa.onrender.com`
- Network tab: Requests đến `https://esp322fa.onrender.com`
- Logs từ ESP32 sẽ xuất hiện trên web app

