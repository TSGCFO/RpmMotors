import sgMail from '@sendgrid/mail';

// Email configuration constants
const RECIPIENT_EMAIL = 'fateh@rpmautosales.ca'; // Default recipient

// Use a verified sender from SendGrid
// IMPORTANT: This must be a fully verified single sender in your SendGrid account
// If using a free SendGrid account, you might need to use your personal email instead
const FROM_EMAIL = 'fateh@rpmautosales.ca'; // Change this to your fully verified sender
const FROM_NAME = 'RPM Auto Website';

// Set up SendGrid mail service
if (!process.env.SENDGRID_API_KEY) {
  console.error("Warning: SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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

// Error interface for typing errors properly
interface SendGridError extends Error {
  code?: number;
  response?: {
    body?: {
      errors?: any[];
    }
  }
}

/**
 * Send an email using SendGrid email service
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("Cannot send email: SENDGRID_API_KEY is not set. Check environment variables.");
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
      replyTo: options.replyTo,
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false
        },
        openTracking: {
          enable: false
        },
        subscriptionTracking: {
          enable: false
        }
      }
    };

    // Log the email details (excluding actual message content for privacy)
    console.log('Sending email to:', msg.to);
    console.log('From:', msg.from);
    console.log('Subject:', msg.subject);
    console.log('Reply-To:', msg.replyTo);

    // Send the email via SendGrid
    await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid');
    return true;
  } catch (error) {
    const sendgridError = error as SendGridError;
    console.error('Error sending email via SendGrid:', sendgridError.message || 'Unknown error');
    
    // Log more detailed information for specific error codes
    if (sendgridError.code === 403) {
      console.error('SendGrid 403 Forbidden error - This usually means:');
      console.error('1. The sending email domain is not verified in your SendGrid account');
      console.error('2. Your SendGrid account might need additional verification');
      console.error('3. Your plan might restrict sending to certain domains');
      
      if (sendgridError.response?.body?.errors) {
        console.error('Detailed errors:', JSON.stringify(sendgridError.response.body.errors, null, 2));
      }
    } else if (sendgridError.code === 401) {
      console.error('SendGrid 401 Unauthorized error - This usually means:');
      console.error('1. The API key is invalid or has been revoked');
      console.error('2. The API key does not have permission to send emails');
    } else if (sendgridError.code === 429) {
      console.error('SendGrid 429 Rate Limit error - You have exceeded your account limits');
    }
    
    return false;
  }
};

// Extend the data interface to make it more type-safe
interface InquiryEmailData {
  name: string;
  email: string;
  phone?: string | null; // Accept null values from the database
  subject: string;
  message: string;
  vehicleId?: number | null; // Accept null values from the database
  inquiryId?: number;
}

/**
 * Format inquiry form data for email submission
 */
export const formatInquiryEmail = (data: InquiryEmailData): EmailOptions => {
  const inquiryReference = data.inquiryId ? `Inquiry Reference: #${data.inquiryId}` : '';
  const vehicleReference = data.vehicleId ? `Related Vehicle ID: ${data.vehicleId}` : '';
  
  // Create a plain text formatted message
  const formattedMessage = `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}
${inquiryReference ? `${inquiryReference}\n` : ''}
${vehicleReference ? `${vehicleReference}\n` : ''}

Message:
${data.message}

This inquiry was sent from the RPM Auto website contact form.
`;

  // Get today's date formatted nicely
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  // Create HTML formatted version with improved styling
  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background-color: #E31837; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .message-box { background-color: #f9f9f9; padding: 15px; border-left: 3px solid #E31837; margin: 15px 0; }
    .reference { background-color: #f5f5f5; padding: 10px; margin-top: 15px; border-radius: 4px; font-family: monospace; }
    .date { color: #777; font-style: italic; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>New Inquiry from RPM Auto Website</h2>
  </div>
  <div class="content">
    <div class="date">Received on ${formattedDate}</div>
    
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
    
    <div class="reference">
      ${inquiryReference ? `<div>${inquiryReference}</div>` : ''}
      ${vehicleReference ? `<div>${vehicleReference}</div>` : ''}
    </div>
  </div>
  <div class="footer">
    <p>This inquiry was sent from the RPM Auto website contact form.</p>
    <p>You can reply directly to this email to respond to the customer.</p>
  </div>
</body>
</html>
`;

  // Include the reference number in the subject for easier email threading
  const emailSubject = data.inquiryId 
    ? `RPM Auto Inquiry #${data.inquiryId}: ${data.subject}` 
    : `New RPM Auto Website Inquiry: ${data.subject}`;

  return {
    subject: emailSubject,
    text: formattedMessage,
    html: htmlMessage,
    replyTo: data.email, // Set reply-to as the customer's email
  };
};