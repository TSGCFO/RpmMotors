# Email Setup Guide for RPM Auto Website

This guide explains how to set up and maintain the email notification system for the RPM Auto website contact form.

## Overview

The website uses SendGrid to deliver email notifications from customer inquiries submitted through the contact form. Due to Microsoft 365's strict email security policies, specific configuration is required to ensure reliable delivery.

## Current Setup

1. **Microsoft 365 Rules**: Rules have been created in Microsoft 365 to allow emails from SendGrid.
2. **SendGrid Configuration**: The website is configured to send emails using a verified sender identity in SendGrid.
3. **Fallback Mechanism**: If email delivery fails, inquiries are still saved in the database with an `email-failed` status.

## How to Configure

### SendGrid Setup

1. **API Key**:
   - Log in to [SendGrid](https://app.sendgrid.com)
   - Navigate to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
   - Set the API key in the website's environment variables as `SENDGRID_API_KEY`

2. **Sender Verification**:
   - In SendGrid, go to Settings → Sender Authentication
   - Select "Verify a Single Sender"
   - Complete the verification form using an existing email address (e.g., fateh@rpmautosales.ca)
   - Follow the verification instructions sent to the email
   - Make sure the sender email in the code matches the verified email

3. **Domain Authentication** (Optional but recommended):
   - In SendGrid, go to Settings → Sender Authentication
   - Select "Authenticate a Domain"
   - Follow the DNS setup instructions
   - This improves email deliverability long-term

### Microsoft 365 Configuration

1. **Connection Filter (Connector)**:
   - Log in to [Microsoft 365 Admin Center](https://admin.microsoft.com)
   - Go to Admin Centers → Exchange
   - Navigate to Mail Flow → Connectors
   - Create a new connector:
     - From: Partner
     - To: Office 365
     - Connection method: IP addresses (use SendGrid's IP ranges)
     - Require TLS: Yes

2. **Anti-spam Rules**:
   - In Exchange Admin Center, go to Protection → Threat policies → Anti-spam
   - Edit the inbound policy
   - Add SendGrid's IP ranges to the allowed IPs list

3. **DMARC Override Rule**:
   - In Exchange Admin Center, go to Mail Flow → Rules
   - Create a rule to bypass DMARC for SendGrid IPs
   - Set the header "X-DMARC-Override" to "bypass"

## Troubleshooting

If emails are not being delivered:

1. **Check Inquiry Status**:
   - Log in to the admin interface
   - View inquiries with "email-failed" status
   - Use the retry functionality to attempt delivery again

2. **Verify Logs**:
   - Check server logs for detailed SendGrid error messages
   - Common issues include:
     - Authentication failures (401)
     - Sender verification issues (403)
     - Rate limiting (429)

3. **Test with New Inquiry**:
   - Submit a test inquiry through the contact form
   - Check logs for any errors
   - Verify if the email arrives at the recipient address

## SendGrid IP Ranges

For reference, here are SendGrid's IP ranges to add to Microsoft 365 rules:

- 167.89.0.0/17
- 208.117.48.0/20
- 50.31.32.0/19
- (Additional ranges might apply based on your SendGrid plan)

## Contact for Support

If you encounter persistent email delivery issues:

1. Check the [SendGrid Documentation](https://docs.sendgrid.com)
2. Review Microsoft 365 [Anti-spam settings](https://docs.microsoft.com/en-us/exchange/antispam-and-antimalware/antispam-protection/antispam-protection)
3. Contact your Microsoft 365 administrator or IT support

## Maintenance

Periodically check:

1. SendGrid account status and API key validity
2. Email delivery success rates in the admin dashboard
3. Updates to Microsoft 365 security policies that might affect email delivery