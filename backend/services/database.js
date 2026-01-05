import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../database/db.json');

// Initialize database structure
const initDB = () => {
  return {
    cards: [
      {
        id: '1',
        uid: 'A1B2C3D4',
        owner: 'Nguyễn Tiến Đạt',
        email: 'dattkdz@gmail.com',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        uid: 'E5F6G7H8',
        owner: 'Nguyễn Sĩ Duy',
        email: 'dattkdz@gmail.com',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        uid: 'I9J0K1L2',
        owner: 'Test User',
        email: 'dattkdz@gmail.com',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ],
    otpSessions: [],
    accessLogs: []
  };
};

// Read database
export const readDB = () => {
  try {
    if (!existsSync(DB_PATH)) {
      const db = initDB();
      writeDB(db);
      return db;
    }
    const data = readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return initDB();
  }
};

// Write database
export const writeDB = (data) => {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Get card by UID
export const getCardByUID = (uid) => {
  const db = readDB();
  return db.cards.find(card => card.uid.toUpperCase() === uid.toUpperCase() && card.status === 'active');
};

// Create OTP session
export const createOTPSession = (cardId, otp, email) => {
  const db = readDB();
  const session = {
    id: Date.now().toString(),
    cardId,
    otp,
    email,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    verified: false
  };
  db.otpSessions.push(session);
  writeDB(db);
  return session;
};

// Verify OTP session
export const verifyOTPSession = (cardId, otp) => {
  const db = readDB();
  const session = db.otpSessions.find(
    s => s.cardId === cardId && 
    s.otp === otp && 
    !s.verified &&
    new Date(s.expiresAt) > new Date()
  );
  
  if (session) {
    session.verified = true;
    session.verifiedAt = new Date().toISOString();
    writeDB(db);
    return session;
  }
  return null;
};

// Add access log
export const addAccessLog = (cardId, uid, status, message, ip = '') => {
  const db = readDB();
  const log = {
    id: Date.now().toString(),
    cardId,
    uid,
    status, // 'success' or 'failed'
    message,
    ip,
    timestamp: new Date().toISOString()
  };
  db.accessLogs.unshift(log); // Add to beginning
  // Keep only last 1000 logs
  if (db.accessLogs.length > 1000) {
    db.accessLogs = db.accessLogs.slice(0, 1000);
  }
  writeDB(db);
  return log;
};

// Get access logs
export const getAccessLogs = (limit = 100) => {
  const db = readDB();
  return db.accessLogs.slice(0, limit);
};

