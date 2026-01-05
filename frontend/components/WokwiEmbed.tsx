'use client';

import { useState } from 'react';

interface WokwiEmbedProps {
  url?: string;
}

export default function WokwiEmbed({ url }: WokwiEmbedProps) {
  // Get Wokwi URL from environment variable or prop
  const defaultUrl = process.env.NEXT_PUBLIC_WOKWI_URL || url || '';
  const [wokwiUrl, setWokwiUrl] = useState(defaultUrl);
  const [showInput, setShowInput] = useState(!defaultUrl);

  // If no URL provided, show input to enter Wokwi project URL
  if (showInput || !wokwiUrl) {
    return (
      <div className="w-full">
        <div className="border border-gray-300 bg-white p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold mb-2">Mạch ESP32 trên Wokwi</h3>
            <p className="text-xs text-gray-600 mb-3">
              Nhập URL project Wokwi của bạn để nhúng vào đây
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={wokwiUrl}
                onChange={(e) => setWokwiUrl(e.target.value)}
                placeholder="https://wokwi.com/projects/xxxxx"
                className="flex-1 px-3 py-2 border border-gray-300 text-sm"
              />
              <button
                onClick={() => {
                  if (wokwiUrl) {
                    setShowInput(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm"
              >
                Load
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Lấy URL: Vào Wokwi project → Click "Share" → Copy URL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Embed Wokwi project
  return (
    <div className="w-full">
      <div className="border border-gray-300 bg-white p-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            Mạch ESP32 trên Wokwi
          </div>
          <button
            onClick={() => setShowInput(true)}
            className="text-xs text-blue-600 hover:underline"
          >
            Đổi URL
          </button>
        </div>
        <div className="relative" style={{ paddingBottom: '75%', height: 0, overflow: 'hidden', minHeight: '500px' }}>
          <iframe
            src={wokwiUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen
            title="Wokwi ESP32 Circuit"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>Mạch đang được nhúng từ Wokwi. Bạn có thể tương tác trực tiếp với mạch ở đây.</p>
        </div>
      </div>
    </div>
  );
}

