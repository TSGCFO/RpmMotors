import { MailService } from '@sendgrid/mail';

// Email configuration constants
const RECIPIENT_EMAIL = 'fateh@rpmautosales.ca'; // Default recipient
const FROM_EMAIL = 'noreply@sendgrid.net'; // Using SendGrid's generic domain that doesn't require separate verification
const FROM_NAME = 'RPM Auto Website';

// Set up SendGrid mail service
if (!process.env.SENDGRID_API_KEY) {
  console.error("Warning: SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
}

// Initialize SendGrid service
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

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
 * Send an email using SendGrid email service
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("Cannot send email: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    console.log("Preparing to send email via SendGrid...");
    
    // Extract plain text from HTML if needed
    let messageText = options.text || '';
    if (!messageText && options.html) {
      // Simple HTML to text conversion
      messageText = options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Prepare SendGrid email object
    const msg = {
      to: options.to || RECIPIENT_EMAIL,
      from: {
        email: options.from || FROM_EMAIL,
        name: FROM_NAME
      },
      subject: options.subject,
      text: messageText,
      html: options.html || '',
      replyTo: options.replyTo
    };

    // Send the email via SendGrid
    await mailService.send(msg);
    console.log('Email sent successfully via SendGrid');
    return true;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    return false;
  }
};

/**
 * Format inquiry form data for submission
 */
export const formatInquiryEmail = (data: any): EmailOptions => {
  // Create a plain text formatted message
  const formattedMessage = `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}

${data.vehicleId ? `Related Vehicle ID: ${data.vehicleId}` : ''}

This inquiry was sent from the RPM Auto website contact form.
`;

  // Create HTML formatted version
  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background-color: #E31837; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .message-box { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #E31837; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>New Inquiry from RPM Auto Website</h2>
  </div>
  <div class="content">
    <div class="field">
      <span class="label">Name:</span> ${data.name}
    </div>
    <div class="field">
      <span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a>
    </div>
    <div class="field">
      <span class="label">Phone:</span> ${data.phone ? `<a href="tel:${data.phone}">${data.phone}</a>` : 'Not provided'}
    </div>
    <div class="field">
      <span class="label">Subject:</span> ${data.subject}
    </div>
    <div class="field">
      <span class="label">Message:</span>
      <div class="message-box">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
    </div>
    ${data.vehicleId ? `<div class="field"><span class="label">Related Vehicle ID:</span> ${data.vehicleId}</div>` : ''}
  </div>
  <div class="footer">
    This inquiry was sent from the RPM Auto website contact form.
  </div>
</body>
</html>
`;

  return {
    subject: `New RPM Auto Website Inquiry: ${data.subject}`,
    text: formattedMessage,
    html: htmlMessage,
    replyTo: data.email, // Set reply-to as the customer's email
  };
};