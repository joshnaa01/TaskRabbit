import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"TaskRabbit Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email successfully dispatched via SMTP to: ${to} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`Disastrous SMTP failure during dispatch to ${to}:`, error);
    throw error;
  }
};
