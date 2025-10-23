export interface WeeklyEmailPayload {
  to: string;
  subject: string;
  html: string;
}

const sendgridKey = process.env.SENDGRID_API_KEY;

export async function sendWeeklyInsightsEmail(payload: WeeklyEmailPayload) {
  if (!sendgridKey) {
    console.warn("SENDGRID_API_KEY not set. Skipping email send.");
    return { skipped: true };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: payload.to }],
          subject: payload.subject,
        },
      ],
      from: {
        email: "insights@localiq.ai",
        name: "LocalIQ",
      },
      content: [
        {
          type: "text/html",
          value: payload.html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid error: ${response.status} ${body}`);
  }

  return { skipped: false };
}
