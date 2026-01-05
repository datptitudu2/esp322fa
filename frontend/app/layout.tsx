import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '2FA RFID ESP32 System',
  description: 'Hệ thống xác thực 2FA sử dụng RFID và ESP32',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}

