# Hướng dẫn cấu hình Email Service

## Bước 1: Tạo file .env

Trong thư mục `backend`, tạo file `.env` (copy từ `env.example`):

```bash
cd backend
cp env.example .env
```

## Bước 2: Cập nhật thông tin email

Mở file `.env` và cập nhật:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=Itfrbzoxxykugfqt
```

**Lưu ý quan trọng:**
- `EMAIL_USER`: Địa chỉ Gmail của bạn (ví dụ: `yourname@gmail.com`)
- `EMAIL_PASS`: App Password bạn vừa tạo, **bỏ tất cả khoảng trắng**
  - Từ: `Itfr bzox xyku gfqt`
  - Thành: `Itfrbzoxxykugfqt`

## Bước 3: Test email service

1. Khởi động backend:
```bash
cd backend
npm start
```

2. Test bằng cách quét thẻ RFID trên frontend
3. Kiểm tra email để nhận OTP

## Lưu ý bảo mật

- **KHÔNG** commit file `.env` lên GitHub
- **KHÔNG** chia sẻ App Password với ai
- App Password đã được thêm vào `.gitignore` để tránh commit nhầm

## Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra lại App Password (đã bỏ khoảng trắng chưa)
- Đảm bảo 2-Step Verification đã bật trên Google Account

### Không nhận được email
- Kiểm tra thư mục Spam
- Kiểm tra console log của backend để xem có lỗi gì không
- Nếu không có email credentials, OTP sẽ được log ra console

