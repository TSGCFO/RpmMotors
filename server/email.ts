import nodemailer from 'nodemailer';

// Email configuration constants
const RECIPIENT_EMAIL = 'fateh@rpmautosales.ca'; // Default recipient
const FROM_NAME = 'RPM Auto Website';

// Check for required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("EMAIL_USER and EMAIL_PASSWORD environment variables must be set");
}

// Create a nodemailer transporter using Microsoft Office 365
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Interface for email options
interface EmailOptions {
  to?: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

/**
 * Send an email using nodemailer
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Verify environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("Cannot send email, EMAIL_USER or EMAIL_PASSWORD not set");
    return false;
  }

  try {
    console.log("Preparing to send email via nodemailer...");
    
    // Set up email data
    const mailOptions = {
      from: `"${FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: options.to || RECIPIENT_EMAIL,
      subject: options.subject,
      text: options.text || 'Message from RPM Auto website (no content provided)',
      html: options.html,
      replyTo: options.replyTo
    };

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via nodemailer:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email with nodemailer:', error);
    return false;
  }
};

/**
 * Format inquiry form data into a professional email
 */
export const formatInquiryEmail = (data: any): EmailOptions => {
  return {
    subject: `New Website Inquiry: ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #E31837; margin: 0;">New Inquiry from RPM Auto Website</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p><strong style="color: #333;">Name:</strong> ${data.name}</p>
          <p><strong style="color: #333;">Email:</strong> ${data.email}</p>
          <p><strong style="color: #333;">Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong style="color: #333;">Subject:</strong> ${data.subject}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Message:</h3>
          <p style="line-height: 1.5;">${data.message.replace(/\n/g, '<br>')}</p>
          ${data.vehicleId ? `<p><strong>Related Vehicle ID:</strong> ${data.vehicleId}</p>` : ''}
        </div>
        
        <div style="font-size: 12px; color: #777; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>This message was sent from the RPM Auto website contact form.</p>
          <p>© ${new Date().getFullYear()} RPM Auto. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
New Inquiry from RPM Auto Website

NAME: ${data.name}
EMAIL: ${data.email}
PHONE: ${data.phone || 'Not provided'}
SUBJECT: ${data.subject}

MESSAGE:
${data.message}

${data.vehicleId ? `Related Vehicle ID: ${data.vehicleId}` : ''}

---
This message was sent from the RPM Auto website contact form.
© ${new Date().getFullYear()} RPM Auto. All rights reserved.
    `,
    replyTo: data.email // Set reply-to as the customer's email for easy replies
  };
};