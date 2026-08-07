import { SmsLog, SmsSettings } from './types';

interface SendSmsOptions {
  toPhone: string;
  recipientName: string;
  message: string;
  type: 'PAYMENT_DUE' | 'MAINTENANCE_UPDATE' | 'EMERGENCY_BROADCAST' | 'WELCOME' | 'CUSTOM';
  triggeredBy?: string;
}

interface SendSmsResult {
  success: boolean;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
  sid: string;
  message: string;
  simulated: boolean;
}

// Lazy Twilio Helper
export function checkTwilioConfiguration(): { configured: boolean; accountSid?: string; fromNumber?: string } {
  const accountSid = typeof process !== 'undefined' ? process.env?.TWILIO_ACCOUNT_SID : undefined;
  const authToken = typeof process !== 'undefined' ? process.env?.TWILIO_AUTH_TOKEN : undefined;
  const fromNumber = typeof process !== 'undefined' ? process.env?.TWILIO_PHONE_NUMBER : undefined;

  const configured = Boolean(accountSid && authToken && fromNumber && accountSid.trim() !== '' && authToken.trim() !== '');
  return { configured, accountSid, fromNumber };
}

/**
  Sends an SMS notification via Twilio REST API if credentials exist,
  or safely simulates sending in development mode.
 */
export async function sendSmsNotification(options: SendSmsOptions): Promise<SendSmsResult> {
  const { toPhone, recipientName, message, type, triggeredBy } = options;
  const { configured, accountSid, fromNumber } = checkTwilioConfiguration();

  // Clean and format phone number
  let formattedPhone = toPhone.trim();
  if (!formattedPhone.startsWith('+')) {
    // Default to Indian country code +91 if 10 digits
    if (formattedPhone.length === 10) {
      formattedPhone = `+91${formattedPhone}`;
    } else {
      formattedPhone = `+${formattedPhone}`;
    }
  }

  const generatedSid = `SM${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  if (configured && accountSid) {
    try {
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append('To', formattedPhone);
      formData.append('From', fromNumber || '+18005550199');
      formData.append('Body', message);

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          status: 'DELIVERED',
          sid: data.sid || generatedSid,
          message: `SMS sent via Twilio to ${formattedPhone}`,
          simulated: false,
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn('Twilio API call failed, falling back to simulation:', errData);
        return {
          success: true,
          status: 'SIMULATED',
          sid: generatedSid,
          message: `Twilio API issue (${errData.message || response.statusText}). Simulated SMS dispatched to ${formattedPhone}.`,
          simulated: true,
        };
      }
    } catch (err: any) {
      console.warn('Twilio request error, falling back to simulation mode:', err?.message);
      return {
        success: true,
        status: 'SIMULATED',
        sid: generatedSid,
        message: `Simulated SMS dispatched to ${formattedPhone} (Twilio offline/sandbox fallback).`,
        simulated: true,
      };
    }
  }

  // Graceful simulation when Twilio API keys are not provided
  return {
    success: true,
    status: 'SIMULATED',
    sid: generatedSid,
    message: `[Simulated SMS Alert] Sent to ${recipientName} (${formattedPhone}): "${message}"`,
    simulated: true,
  };
}

// Preset SMS Helper Generators
export function buildPaymentDueSmsText(residentName: string, amount: number, dueDate: string, roomNumber?: string): string {
  return `Grand Horizon Hostel: Dear ${residentName}, your rent invoice of ₹${amount.toLocaleString('en-IN')}${roomNumber ? ` (Room ${roomNumber})` : ''} is due on ${dueDate}. Please pay via PhonePe on your resident portal to avoid late fees.`;
}

export function buildOverduePaymentSmsText(residentName: string, amount: number, dueDate: string): string {
  return `URGENT - Grand Horizon Hostel: Dear ${residentName}, your rent payment of ₹${amount.toLocaleString('en-IN')} due on ${dueDate} is now OVERDUE. Kindly clear it immediately via the portal.`;
}

export function buildMaintenanceUpdateSmsText(residentName: string, ticketTitle: string, status: string, roomNumber: string): string {
  return `Grand Horizon Hostel Alert: Dear ${residentName}, your maintenance request "${ticketTitle}" for Room ${roomNumber} is now marked as "${status.toUpperCase()}". Thank you for your patience!`;
}

export function buildEmergencyBroadcastSmsText(headline: string, body: string): string {
  return `🚨 EMERGENCY HOSTEL BROADCAST [Grand Horizon]: ${headline.toUpperCase()} - ${body}. Contact Warden immediately for urgent support (+91 98765 00001).`;
}

export function buildWelcomeSmsText(residentName: string, roomNumber: string): string {
  return `Welcome to Grand Horizon Hostel! Dear ${residentName}, your room ${roomNumber} is ready. Login to your Resident Portal to view rent invoices, request maintenance & receive updates.`;
}
