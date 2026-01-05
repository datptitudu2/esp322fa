'use client';

import { useEffect, useState } from 'react';
import { getAccessLogs, AccessLog } from '@/lib/api';

export default function AccessHistory() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000); // Refresh every 2 seconds để cập nhật nhanh hơn
    return () => clearInterval(interval);
  }, [filter]);

  const loadLogs = async () => {
    try {
      const response = await getAccessLogs(50);
      let filteredLogs = response.logs || [];
      
      if (filter !== 'all') {
        filteredLogs = filteredLogs.filter((log: AccessLog) => log.status === filter);
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      // Silent error handling for production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading logs:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-white border border-gray-300 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lịch sử truy cập</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-3 py-1 text-sm ${filter === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Thành công
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1 text-sm ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Thất bại
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Chưa có lịch sử</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-2">Thời gian</th>
                <th className="text-left py-2 px-2">UID</th>
                <th className="text-left py-2 px-2">Chủ thẻ</th>
                <th className="text-left py-2 px-2">Trạng thái</th>
                <th className="text-left py-2 px-2">Thông báo</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200">
                  <td className="py-2 px-2">{formatDate(log.timestamp)}</td>
                  <td className="py-2 px-2 font-mono text-xs">{log.uid}</td>
                  <td className="py-2 px-2">{log.owner || 'N/A'}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`inline-block px-2 py-1 ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                    </span>
                  </td>
                  <td className="py-2 px-2">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

