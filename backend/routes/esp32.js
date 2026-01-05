import express from 'express';
import { getCardByUID, createOTPSession, verifyOTPSession, addAccessLog } from '../services/database.js';
import { generateOTP } from '../services/otpService.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// ESP32: Scan RFID card
router.post('/scan', async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'UID is required' 
      });
    }

    const card = getCardByUID(uid);

    if (!card) {
      addAccessLog('', uid, 'failed', 'Card not found', req.ip);
      return res.json({
        status: 'error',
        message: 'Card not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const session = createOTPSession(card.id, otp, card.email);

    // Send email
    await sendOTPEmail(card.email, otp, card.owner);

    res.json({
      status: 'otp_required',
      message: 'Enter OTP',
      cardId: card.id,
      owner: card.owner
    });
  } catch (error) {
    console.error('Error in ESP32 scan:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
});

// ESP32: Verify OTP and get access result
router.post('/verify', (req, res) => {
  try {
    const { cardId, otp, uid } = req.body;

    if (!cardId || !otp || !uid) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing parameters'
      });
    }

    const session = verifyOTPSession(cardId, otp);

    if (!session) {
      addAccessLog(cardId, uid, 'failed', 'Invalid OTP', req.ip);
      return res.json({
        status: 'denied',
        message: 'Access Denied'
      });
    }

    addAccessLog(cardId, uid, 'success', 'Access Granted', req.ip);

    res.json({
      status: 'granted',
      message: 'Access Granted'
    });
  } catch (error) {
    console.error('Error in ESP32 verify:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// ESP32: Check status (polling endpoint)
router.get('/status/:cardId', (req, res) => {
  try {
    const { cardId } = req.params;
    // This can be used for polling if needed
    res.json({
      status: 'ok',
      cardId
    });
  } catch (error) {
    console.error('Error in ESP32 status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint tương thích với code Wokwi hiện tại
// POST /api/esp32/verify-rfid (tương thích với code Wokwi)
router.post('/verify-rfid', async (req, res) => {
  try {
    const { rfid_uid } = req.body;

    if (!rfid_uid) {
      return res.status(400).json({ 
        success: false,
        error: 'rfid_uid is required' 
      });
    }

    const card = getCardByUID(rfid_uid);

    if (!card) {
      return res.json({
        success: false,
        message: 'Card not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const session = createOTPSession(card.id, otp, card.email);

    // Send email
    const emailResult = await sendOTPEmail(card.email, otp, card.owner);

    res.json({
      success: true,
      email_sent: emailResult.success,
      otp_code: otp, // Trả về OTP để hiển thị trên OLED nếu email không gửi được
      card_id: card.id,
      user_name: card.owner,
      user_email: card.email
    });
  } catch (error) {
    console.error('Error in verify-rfid:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// API endpoint để log access từ ESP32
// POST /api/esp32/log-access
router.post('/log-access', (req, res) => {
  try {
    const { rfid_uid, user_name, success, timestamp } = req.body;

    if (!rfid_uid) {
      return res.status(400).json({ 
        success: false,
        error: 'rfid_uid is required' 
      });
    }

    // Tìm card
    const card = getCardByUID(rfid_uid);
    const cardId = card ? card.id : '';

    // Ghi log
    const message = success ? 'Access Granted' : 'Access Denied';
    addAccessLog(cardId, rfid_uid, success ? 'success' : 'failed', message, req.ip);

    res.json({
      success: true,
      message: 'Log saved'
    });
  } catch (error) {
    console.error('Error in log-access:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;

