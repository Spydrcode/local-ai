import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Create a booking/appointment confirmation email for ${business_name}, a ${business_type} business.

**Goals**:
- Confirm appointment details
- Reduce no-shows
- Set expectations
- Build excitement

**Include**:
- Date, time, location
- What to bring/prepare
- How to reschedule/cancel
- Reminder about policies
- Add-to-calendar link suggestion
- Contact info

Return ONLY valid JSON with:
{
  "subject": "Appointment confirmed for [DATE]",
  "body": "Email body with placeholders [DATE], [TIME], [SERVICE]",
  "sms_version": "Short SMS confirmation (160 chars)",
  "reminder_schedule": "When to send reminders (24hrs, 1hr before)",
  "cancellation_policy": "How to handle cancellations"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate booking confirmation" }, { status: 500 });
  }
}
