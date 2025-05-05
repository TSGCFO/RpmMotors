import nodemailer from 'nodemailer';

// Create a nodemailer transporter using Office 365 SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'fateh@rpmautosales.ca',
    pass: process.env.EMAIL_PASSWORD || '' // This should be set in environment variables
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

interface EmailOptions {
  to?: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const defaultOptions = {
      to: 'fateh@rpmautosales.ca', // Default recipient
      from: process.env.EMAIL_USER || 'fateh@rpmautosales.ca',
      replyTo: options.replyTo || options.from
    };

    const emailOptions = { ...defaultOptions, ...options };
    
    await transporter.sendMail(emailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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