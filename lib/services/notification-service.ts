/**
 * NotificationService: Send alerts via email, SMS, in-app
 *
 * Supports:
 * - Email via SendGrid/Resend
 * - SMS via Twilio
 * - In-app notifications (stored in DB)
 */

import { ContractorAlert, NotificationChannel, NotificationSent } from '@/lib/types/contractor-monitoring';

interface NotificationRecipients {
  email?: string;
  phone?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class NotificationService {
  /**
   * Send notification via specified channels
   */
  static async sendAlertNotification(
    alert: ContractorAlert,
    channels: NotificationChannel[],
    recipients: NotificationRecipients
  ): Promise<NotificationSent[]> {
    const results: NotificationSent[] = [];

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            if (recipients.email) {
              await this.sendEmail(alert, recipients.email);
              results.push({
                channel: 'email',
                sent_at: new Date().toISOString(),
                success: true,
              });
            }
            break;

          case 'sms':
            if (recipients.phone) {
              await this.sendSMS(alert, recipients.phone);
              results.push({
                channel: 'sms',
                sent_at: new Date().toISOString(),
                success: true,
              });
            }
            break;

          case 'in_app':
            // In-app notifications are just the alert stored in DB
            results.push({
              channel: 'in_app',
              sent_at: new Date().toISOString(),
              success: true,
            });
            break;
        }
      } catch (error: any) {
        results.push({
          channel,
          sent_at: new Date().toISOString(),
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send email notification
   */
  private static async sendEmail(alert: ContractorAlert, email: string): Promise<void> {
    const template = this.buildEmailTemplate(alert);

    // NOTE: Replace with actual email service (SendGrid, Resend, AWS SES)
    // For now, log to console
    console.log('[NotificationService] Sending email to:', email);
    console.log('Subject:', template.subject);
    console.log('Body:', template.text);

    // Example using Resend (when configured):
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'alerts@yourdomain.com',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    */
  }

  /**
   * Send SMS notification
   */
  private static async sendSMS(alert: ContractorAlert, phone: string): Promise<void> {
    const message = this.buildSMSMessage(alert);

    // NOTE: Replace with actual SMS service (Twilio)
    console.log('[NotificationService] Sending SMS to:', phone);
    console.log('Message:', message);

    // Example using Twilio (when configured):
    /*
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await twilio.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
      body: message,
    });
    */
  }

  /**
   * Build email template from alert
   */
  private static buildEmailTemplate(alert: ContractorAlert): EmailTemplate {
    const severity_emoji =
      alert.severity === 'critical'
        ? '🚨'
        : alert.severity === 'high'
        ? '⚠️'
        : alert.severity === 'medium'
        ? '⚡'
        : 'ℹ️';

    const subject = `${severity_emoji} ${alert.title}`;

    const text = `
${alert.title}

${alert.message}

Top Actions:
${alert.recommended_actions
  .slice(0, 3)
  .map((a, i) => `${i + 1}. ${a.action} (${a.estimated_time || 'Quick'})`)
  .join('\n')}

View full alert and take action:
https://yourdomain.com/contractor/alerts/${alert.id}

---
Forecasta AI | Contractor Copilot
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: ${this.getSeverityColor(alert.severity)}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .actions { background: white; padding: 15px; border-left: 4px solid ${this.getSeverityColor(alert.severity)}; margin: 15px 0; }
    .action-item { margin: 10px 0; }
    .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { padding: 15px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${severity_emoji} ${alert.title}</h1>
  </div>
  <div class="content">
    <p><strong>${alert.message}</strong></p>

    <div class="actions">
      <h3>Recommended Actions:</h3>
      ${alert.recommended_actions
        .slice(0, 3)
        .map(
          (a, i) => `
        <div class="action-item">
          <strong>${i + 1}. ${a.action}</strong><br>
          <small>⏱️ ${a.estimated_time || 'Quick'} | 📁 ${a.category}</small>
        </div>
      `
        )
        .join('')}
    </div>

    <a href="https://yourdomain.com/contractor/alerts/${alert.id}" class="btn">
      View Full Alert & Take Action
    </a>
  </div>
  <div class="footer">
    Forecasta AI | Contractor Copilot<br>
    <a href="https://yourdomain.com/contractor/alerts/settings">Manage Alert Settings</a>
  </div>
</body>
</html>
    `.trim();

    return { subject, html, text };
  }

  /**
   * Build SMS message from alert
   */
  private static buildSMSMessage(alert: ContractorAlert): string {
    const severity_emoji =
      alert.severity === 'critical'
        ? '🚨'
        : alert.severity === 'high'
        ? '⚠️'
        : alert.severity === 'medium'
        ? '⚡'
        : 'ℹ️';

    const top_action = alert.recommended_actions[0];

    return `${severity_emoji} ${alert.title}

${alert.message}

Top action: ${top_action.action}

View: https://yourdomain.com/contractor/alerts/${alert.id}`;
  }

  /**
   * Get severity color for email styling
   */
  private static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#dc2626'; // red-600
      case 'high':
        return '#ea580c'; // orange-600
      case 'medium':
        return '#ca8a04'; // yellow-600
      case 'low':
        return '#2563eb'; // blue-600
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Send batch digest (daily/weekly summary)
   */
  static async sendAlertDigest(
    alerts: ContractorAlert[],
    email: string,
    period: 'daily' | 'weekly'
  ): Promise<void> {
    const subject = `${period === 'daily' ? '📅 Daily' : '📊 Weekly'} Alert Digest — ${alerts.length} alerts`;

    const grouped_by_severity = {
      critical: alerts.filter((a) => a.severity === 'critical'),
      high: alerts.filter((a) => a.severity === 'high'),
      medium: alerts.filter((a) => a.severity === 'medium'),
      low: alerts.filter((a) => a.severity === 'low'),
    };

    const text = `
${period === 'daily' ? 'Daily' : 'Weekly'} Alert Digest

${grouped_by_severity.critical.length > 0 ? `🚨 CRITICAL (${grouped_by_severity.critical.length}):\n${grouped_by_severity.critical.map((a) => `- ${a.title}`).join('\n')}\n` : ''}
${grouped_by_severity.high.length > 0 ? `⚠️ HIGH (${grouped_by_severity.high.length}):\n${grouped_by_severity.high.map((a) => `- ${a.title}`).join('\n')}\n` : ''}
${grouped_by_severity.medium.length > 0 ? `⚡ MEDIUM (${grouped_by_severity.medium.length}):\n${grouped_by_severity.medium.map((a) => `- ${a.title}`).join('\n')}\n` : ''}
${grouped_by_severity.low.length > 0 ? `ℹ️ LOW (${grouped_by_severity.low.length}):\n${grouped_by_severity.low.map((a) => `- ${a.title}`).join('\n')}\n` : ''}

View all alerts:
https://yourdomain.com/contractor/alerts

---
Forecasta AI | Contractor Copilot
    `.trim();

    console.log('[NotificationService] Sending digest email to:', email);
    console.log('Subject:', subject);
    console.log('Body:', text);

    // Would use actual email service here
  }
}
