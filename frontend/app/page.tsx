'use client';

import { useState, useEffect } from 'react';
import WokwiEmbed from '@/components/WokwiEmbed';
import OTPInput from '@/components/OTPInput';
import AccessHistory from '@/components/AccessHistory';
import { validateRFID, requestOTP, getCards, Card } from '@/lib/api';

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [uid, setUid] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await getCards();
      setCards(response.cards || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleScanCard = async (cardUid: string) => {
    setLoading(true);
    setMessage('');
    setOtpRequested(false);
    setSelectedCard(null);

    try {
      const result = await validateRFID(cardUid);
      
      if (result.success && result.card) {
        setSelectedCard(result.card);
        setUid(cardUid);
        
        // Request OTP
        const otpResult = await requestOTP(result.card.id, cardUid);
        
        if (otpResult.success) {
          setOtpRequested(true);
          setMessage('Mã OTP đã được gửi đến email. Vui lòng kiểm tra hộp thư.');
          setMessageType('success');
        } else {
          setMessage('Lỗi khi gửi OTP. Vui lòng thử lại.');
          setMessageType('error');
        }
      } else {
        setMessage('Thẻ không hợp lệ hoặc không tồn tại.');
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Lỗi khi quét thẻ.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setMessage('Xác thực thành công! Truy cập được cấp phép.');
    setMessageType('success');
    setOtpRequested(false);
    setSelectedCard(null);
    setUid('');
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleOTPError = (errorMsg: string) => {
    setMessage(errorMsg);
    setMessageType('error');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hệ thống xác thực 2FA RFID + ESP32
          </h1>
          <p className="text-gray-600">
            Nghiên cứu, xây dựng mô hình xác thực 2FA ứng dụng RFID và vi điều khiển ESP32
          </p>
        </header>

        {message && (
          <div
            className={`mb-6 p-4 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <WokwiEmbed />
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-300 p-4">
              <h2 className="text-lg font-semibold mb-4">Quét thẻ RFID</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn thẻ RFID (hoặc nhập UID)
                </label>
                <div className="flex gap-2">
                  <select
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300"
                    disabled={loading}
                  >
                    <option value="">-- Chọn thẻ --</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.uid}>
                        {card.uid} - {card.owner}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleScanCard(uid)}
                    disabled={!uid || loading}
                    className="px-4 py-2 bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang xử lý...' : 'Quét thẻ'}
                  </button>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={uid}
                    onChange={(e) => setUid(e.target.value.toUpperCase())}
                    placeholder="Hoặc nhập UID thẻ (ví dụ: A1B2C3D4)"
                    className="w-full px-3 py-2 border border-gray-300 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {selectedCard && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
                  <p className="text-sm">
                    <strong>Chủ thẻ:</strong> {selectedCard.owner}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {selectedCard.email}
                  </p>
                  <p className="text-sm">
                    <strong>UID:</strong> <span className="font-mono">{selectedCard.uid}</span>
                  </p>
                </div>
              )}
            </div>

            {otpRequested && selectedCard && (
              <div className="bg-white border border-gray-300 p-4">
                <h2 className="text-lg font-semibold mb-4">Xác thực OTP</h2>
                <OTPInput
                  cardId={selectedCard.id}
                  uid={uid}
                  onSuccess={handleOTPSuccess}
                  onError={handleOTPError}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <AccessHistory />
        </div>
      </div>
    </div>
  );
}
