import express from 'express';
import { getCardByUID, createOTPSession, verifyOTPSession, addAccessLog } from '../services/database.js';
import { generateOTP } from '../services/otpService.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// API endpoint tương thích với code Wokwi hiện tại
// POST /api/verify-rfid
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

export default router;

