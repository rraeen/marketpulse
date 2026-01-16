import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASS || 'pass',
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- END MOCK ---');
    return { messageId: 'mock-id' };
  }

  return await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"MarketPulse" <no-reply@marketpulse.com>',
    to,
    subject,
    html,
  });
}
