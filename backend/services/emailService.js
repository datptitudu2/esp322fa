import nodemailer from 'nodemailer';

let transporter = null;

// Initialize email transporter
const initTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. OTP will be logged to console.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  return transporter;
};

// Send OTP email
export const sendOTPEmail = async (email, otp, ownerName) => {
  const emailTransporter = initTransporter();

  if (!emailTransporter) {
    // Fallback: log to console for development
    console.log('='.repeat(50));
    console.log('OTP EMAIL (Development Mode)');
    console.log('To:', email);
    console.log('OTP Code:', otp);
    console.log('Card Owner:', ownerName);
    console.log('='.repeat(50));
    return { success: true, mode: 'console' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP xác thực 2FA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Mã OTP xác thực 2FA</h2>
          <p>Xin chào <strong>${ownerName}</strong>,</p>
          <p>Bạn đã quét thẻ RFID thành công. Vui lòng sử dụng mã OTP sau để hoàn tất xác thực:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #ddd;">
            <h1 style="color: #0066cc; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 12px;">Mã OTP này có hiệu lực trong 5 phút.</p>
          <p style="color: #666; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback to console
    console.log('='.repeat(50));
    console.log('OTP EMAIL (Fallback)');
    console.log('To:', email);
    console.log('OTP Code:', otp);
    console.log('='.repeat(50));
    return { success: false, error: error.message, mode: 'console' };
  }
};

