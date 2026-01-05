import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Card {
  id: string;
  uid: string;
  owner: string;
  email: string;
}

export interface AccessLog {
  id: string;
  cardId: string;
  uid: string;
  status: 'success' | 'failed';
  message: string;
  timestamp: string;
  owner?: string;
  email?: string;
}

// RFID API
export const validateRFID = async (uid: string) => {
  const response = await api.post('/rfid/validate', { uid });
  return response.data;
};

// OTP API
export const requestOTP = async (cardId: string, uid: string) => {
  const response = await api.post('/otp/request', { cardId, uid });
  return response.data;
};

export const verifyOTP = async (cardId: string, otp: string, uid: string) => {
  const response = await api.post('/otp/verify', { cardId, otp, uid });
  return response.data;
};

// Access API
export const getAccessLogs = async (limit?: number) => {
  const response = await api.get('/access/logs', { params: { limit } });
  return response.data;
};

export const getCards = async () => {
  const response = await api.get('/access/cards');
  return response.data;
};

// ESP32 API
export const esp32Scan = async (uid: string) => {
  const response = await api.post('/esp32/scan', { uid });
  return response.data;
};

export const esp32Verify = async (cardId: string, otp: string, uid: string) => {
  const response = await api.post('/esp32/verify', { cardId, otp, uid });
  return response.data;
};

