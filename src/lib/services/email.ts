import nodemailer from 'nodemailer';

// Fail fast in production if SMTP is not configured
function getSmtpConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (isProduction) {
    if (!host || !user || !pass) {
      throw new Error(
        'SMTP configuration required in production. Missing: ' +
        [host ? '' : 'SMTP_HOST', user ? '' : 'SMTP_USER', pass ? '' : 'SMTP_PASS']
          .filter(Boolean)
          .join(', ')
      );
    }
  }

  // In development, allow fallbacks for testing
  return {
    host: host || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: user || 'user',
      pass: pass || 'pass',
    },
  };
}

const transporter = nodemailer.createTransport(getSmtpConfig());

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
