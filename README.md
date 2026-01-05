# Hệ thống xác thực 2FA RFID + ESP32

Nghiên cứu, xây dựng mô hình xác thực hai yếu tố sử dụng RFID và vi điều khiển ESP32.

## Thành viên

- Nguyễn Tiến Đạt - B23DCCC034
- Nguyễn Sĩ Duy - B23DCCC050

## Cấu trúc dự án

```
adurinonckh/
├── backend/          # Node.js/Express API server
├── frontend/        # Next.js web application
├── wokwi-circuit/   # ESP32 code và hướng dẫn Wokwi
└── README.md
```

## Tính năng

- Mô phỏng mạch ESP32 trên Wokwi với RFID reader, LCD, LED, Relay, Buzzer
- Web application để quản lý và xác thực
- Backend API xử lý logic 2FA
- Gửi OTP qua email
- Lịch sử truy cập

## Setup Local

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Cập nhật .env với thông tin email
npm start
```

Backend chạy tại `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3000`

### Environment Variables

**Backend (.env):**
```
PORT=3001
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Setup Wokwi Circuit

1. Truy cập [Wokwi.com](https://wokwi.com)
2. Tạo project mới, chọn ESP32 DevKit
3. Thêm components: RC522, LCD I2C, LEDs, Relay, Buzzer
4. Kết nối theo sơ đồ trong `wokwi-circuit/README.md`
5. Copy code từ `wokwi-circuit/code.ino`
6. Cập nhật WiFi credentials và API URL trong code
7. Chạy simulation

## Deploy lên Render

1. Push code lên GitHub
2. Tạo 2 services trên Render:
   - Backend: Web Service, build command `cd backend && npm install`, start command `cd backend && npm start`
   - Frontend: Web Service, build command `cd frontend && npm install && npm run build`, start command `cd frontend && npm start`
3. Cấu hình environment variables trên Render
4. Lấy URL backend và cập nhật vào ESP32 code và frontend

## Quy trình xác thực

1. User quét thẻ RFID trên mạch Wokwi
2. ESP32 gửi UID lên backend API
3. Backend validate thẻ và tạo OTP
4. Backend gửi OTP qua email
5. User nhập OTP trên web app
6. Backend verify OTP
7. Nếu đúng: ESP32 kích hoạt relay, LED xanh, buzzer
8. Ghi log truy cập

## Tài liệu

- [SETUP.md](SETUP.md) - Hướng dẫn setup chi tiết
- [DEMO_GUIDE.md](DEMO_GUIDE.md) - Script demo cho bảo vệ
- [DEPLOY.md](DEPLOY.md) - Hướng dẫn deploy lên Render
- [CHECKLIST.md](CHECKLIST.md) - Checklist hoàn thiện dự án
- [wokwi-circuit/SETUP_WOKWI.md](wokwi-circuit/SETUP_WOKWI.md) - Hướng dẫn setup Wokwi chi tiết
- [backend/SETUP_EMAIL.md](backend/SETUP_EMAIL.md) - Hướng dẫn cấu hình email

## Lưu ý

- Email service cần Gmail App Password (không phải password thường)
- Wokwi circuit cần WiFi credentials và backend URL
- Backend phải accessible từ internet để ESP32 gọi được API
- Database sử dụng JSON file (có thể nâng cấp lên SQLite sau)
- Email service có fallback mode: OTP sẽ được log ra console nếu không gửi được email

## Công nghệ sử dụng

- **Backend:** Node.js, Express, Nodemailer
- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Hardware Simulation:** Wokwi (ESP32, MFRC522, LCD, LEDs, Relay, Buzzer)
- **Database:** JSON file (có thể nâng cấp lên SQLite/PostgreSQL)
- **Deployment:** Render.com (free tier)

## Quick Start

1. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd adurinonckh
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Tạo .env từ env.example và cập nhật thông tin
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Test:**
   - Mở http://localhost:3000
   - Chọn thẻ RFID và quét
   - Nhập OTP từ console log

Xem [SETUP.md](SETUP.md) để biết chi tiết hơn.

