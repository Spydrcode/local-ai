import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, response_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Create auto-response templates for ${business_name}, a ${business_type} business.

**Response Types Needed**:
1. Out of Office
2. After Hours
3. Weekend/Holiday Closed
4. Received Your Message (auto-reply)

**Requirements for Each**:
- Professional but friendly
- Set expectations (when they'll hear back)
- Provide alternative contact if urgent
- Include business hours
- ${response_type || 'All types'}

Return ONLY valid JSON with:
{
  "out_of_office": {"subject": "", "body": ""},
  "after_hours": {"subject": "", "body": ""},
  "weekend_holiday": {"subject": "", "body": ""},
  "message_received": {"subject": "", "body": ""},
  "urgent_contact": "Emergency contact info if needed"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate auto-responses" }, { status: 500 });
  }
}
