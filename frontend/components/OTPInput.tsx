'use client';

import { useState } from 'react';
import { verifyOTP, esp32Verify } from '@/lib/api';

interface OTPInputProps {
  cardId: string;
  uid: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function OTPInput({ cardId, uid, onSuccess, onError }: OTPInputProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      onError('Mã OTP phải là 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP via ESP32 endpoint
      const result = await esp32Verify(cardId, otp, uid);
      
      if (result.status === 'granted') {
        // Đợi một chút để backend ghi log xong
        await new Promise(resolve => setTimeout(resolve, 500));
        onSuccess();
        setOtp('');
      } else {
        onError('Mã OTP không đúng hoặc đã hết hạn');
      }
    } catch (error: any) {
      onError(error.response?.data?.message || 'Lỗi xác thực OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
          Nhập mã OTP (6 chữ số)
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(value);
          }}
          className="w-full px-4 py-2 border border-gray-300 text-center text-2xl tracking-widest font-mono"
          placeholder="000000"
          maxLength={6}
          disabled={loading}
          autoComplete="off"
        />
      </div>
      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-blue-600 text-white py-2 px-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
      </button>
    </form>
  );
}

