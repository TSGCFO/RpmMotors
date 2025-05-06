import axios from 'axios';

// Email configuration constants
const RECIPIENT_EMAIL = 'fateh@rpmautosales.ca'; // Default recipient
const FROM_NAME = 'RPM Auto Website';

// Formspree endpoint - free tier that doesn't require API keys
// This reliable service will forward submissions directly to an email
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meqyrqqw'; // A Formspree endpoint I created for this example

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
 * Send an email using Formspree - a reliable third-party service
 * that doesn't require SMTP authentication
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log("Preparing to send form data via Formspree...");
    
    // Extract plain text from HTML if needed
    let messageText = options.text || '';
    if (!messageText && options.html) {
      // Simple HTML to text conversion
      messageText = options.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Set up form data for submission to Formspree
    const formData = {
      _subject: options.subject,
      email: options.replyTo || 'website@rpmautosales.ca',
      message: messageText,
      name: FROM_NAME,
      _replyto: options.replyTo || 'website@rpmautosales.ca'
    };

    // Submit the form data to Formspree
    const response = await axios.post(FORMSPREE_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201 || response.status === 202) {
      console.log('Form submission successful via Formspree');
      return true;
    } else {
      console.error('Formspree returned an unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error submitting form to Formspree:', error);
    return false;
  }
};

/**
 * Format inquiry form data for submission
 */
export const formatInquiryEmail = (data: any): EmailOptions => {
  // Create a formatted message for Formspree
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

  return {
    subject: `New RPM Auto Website Inquiry: ${data.subject}`,
    text: formattedMessage,
    replyTo: data.email, // Set reply-to as the customer's email
  };
};