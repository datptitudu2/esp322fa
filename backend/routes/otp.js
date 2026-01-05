import express from 'express';
import { createOTPSession, verifyOTPSession, addAccessLog, getCardByUID } from '../services/database.js';
import { generateOTP } from '../services/otpService.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// Request OTP (after RFID validation)
router.post('/request', async (req, res) => {
  try {
    const { cardId, uid } = req.body;

    if (!cardId || !uid) {
      return res.status(400).json({ error: 'Card ID and UID are required' });
    }

    const card = getCardByUID(uid);
    if (!card || card.id !== cardId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Create session
    const session = createOTPSession(cardId, otp, card.email);

    // Send email
    const emailResult = await sendOTPEmail(card.email, otp, card.owner);

    res.json({
      success: true,
      sessionId: session.id,
      message: 'OTP sent to email',
      emailSent: emailResult.success,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify', (req, res) => {
  try {
    const { cardId, otp, uid } = req.body;

    if (!cardId || !otp || !uid) {
      return res.status(400).json({ error: 'Card ID, OTP, and UID are required' });
    }

    // Verify OTP
    const session = verifyOTPSession(cardId, otp);

    if (!session) {
      // Log failed attempt
      addAccessLog(cardId, uid, 'failed', 'Invalid or expired OTP', req.ip);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Log successful access
    addAccessLog(cardId, uid, 'success', '2FA authentication successful', req.ip);

    res.json({
      success: true,
      message: 'Authentication successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

