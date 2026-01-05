# Cập nhật Frontend để kết nối Render Backend

## ✅ Đã tạo file `.env.local`

File `frontend/.env.local` đã được tạo với:
```
NEXT_PUBLIC_API_URL=https://esp322fa.onrender.com
```

## 🔄 Bước tiếp theo

### 1. Restart Frontend Dev Server

Frontend cần restart để load environment variable mới:

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd frontend
npm run dev
```

### 2. Kiểm tra kết nối

1. Mở browser: `http://localhost:3000`
2. Kiểm tra "Lịch sử truy cập"
3. Log từ ESP32 sẽ xuất hiện sau 2 giây

### 3. Verify API URL

Mở browser console (F12) và kiểm tra:
- Network tab → Xem requests đến `https://esp322fa.onrender.com`
- Console → Không có CORS errors

## 🎯 Kết quả mong đợi

Sau khi restart:
- ✅ Frontend kết nối đến Render backend
- ✅ Log từ ESP32 hiển thị trên web app
- ✅ Verify OTP trên web app cũng ghi log lên Render backend

## 📝 Lưu ý

- File `.env.local` đã có trong `.gitignore` (không commit lên GitHub)
- Nếu muốn deploy frontend lên Render, cần set environment variable trên Render dashboard

