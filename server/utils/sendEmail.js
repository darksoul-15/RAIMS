// server/utils/sendEmail.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const TEMPLATES = {
  ApprovalRequest:     (msg) => `<p><strong>Action Required:</strong> ${msg}</p><p>Log in to RAIMS to review the request.</p>`,
  CheckoutConfirmation:(msg) => `<p><strong>Checkout Confirmed:</strong> ${msg}</p><p>Please return the asset by the due date.</p>`,
  ReturnReminder:      (msg) => `<p><strong>Return Reminder:</strong> ${msg}</p><p>Please return the asset promptly to avoid overdue status.</p>`,
  OverdueAlert:        (msg) => `<p style="color:red"><strong>OVERDUE:</strong> ${msg}</p><p>Please return the asset immediately.</p>`,
  InventoryUpdate:     (msg) => `<p><strong>Inventory Update:</strong> ${msg}</p>`
};

const SUBJECTS = {
  ApprovalRequest:      'RAIMS — New Request Pending Approval',
  CheckoutConfirmation: 'RAIMS — Checkout Confirmed',
  ReturnReminder:       'RAIMS — Return Reminder',
  OverdueAlert:         'RAIMS — Overdue Asset Alert',
  InventoryUpdate:      'RAIMS — Inventory Update'
};

const sendEmail = async ({ to, type, message }) => {
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'test') return;
  try {
    await resend.emails.send({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: SUBJECTS[type] || 'RAIMS Notification',
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1e40af">RAIMS</h2>
        ${(TEMPLATES[type] || ((m) => `<p>${m}</p>`))(message)}
        <hr/><p style="color:#6b7280;font-size:12px">Research Asset & Inventory Management System — Ré</p>
      </div>`
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = sendEmail;
