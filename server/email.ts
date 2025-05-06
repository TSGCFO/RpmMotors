import { MailService } from '@sendgrid/mail';

// Check if SendGrid API key is set
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email sending will not work.");
}

// Initialize SendGrid mail service
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to?: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API Key not set. Cannot send email.');
    return false;
  }

  try {
    // Use a SendGrid-approved sender domain to avoid DMARC issues
    // SendGrid dynamic templates require a verified sender
    const defaultSender = {
      email: 'noreply@reply.sendgrid.net', // SendGrid's approved domain
      name: 'RPM Auto Website'
    };

    // Format email data according to SendGrid's v3 Mail Send API requirements
    const emailData: any = {
      to: options.to || 'fateh@rpmautosales.ca',
      from: {
        email: defaultSender.email,
        name: defaultSender.name
      },
      subject: options.subject,
      reply_to: {
        email: options.replyTo || options.from || defaultSender.email,
        name: "Customer"
      }
    };

    // Add HTML content if available
    if (options.html) {
      emailData.html = options.html;
    }

    // Add text content if available
    if (options.text) {
      emailData.text = options.text;
    } else if (!options.html) {
      // Fallback if neither html nor text is provided
      emailData.text = 'Message from RPM Auto website (no content provided)';
    }

    await mailService.send(emailData);
    console.log('Email sent successfully via SendGrid');
    return true;
  } catch (error) {
    console.error('Error sending email with SendGrid:', error);
    return false;
  }
};

// Function to format inquiry form data into an email
export const formatInquiryEmail = (data: any): EmailOptions => {
  return {
    subject: `New Website Inquiry: ${data.subject}`,
    html: `
      <h2>New Inquiry from Website</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <h3>Message:</h3>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
      ${data.vehicleId ? `<p><strong>Related Vehicle ID:</strong> ${data.vehicleId}</p>` : ''}
    `,
    text: `
      New Inquiry from Website
      
      Name: ${data.name}
      Email: ${data.email}
      Phone: ${data.phone || 'Not provided'}
      Subject: ${data.subject}
      
      Message:
      ${data.message}
      
      ${data.vehicleId ? `Related Vehicle ID: ${data.vehicleId}` : ''}
    `,
    replyTo: data.email // Set reply-to as the customer's email
  };
};