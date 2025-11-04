import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  try {
    const { data: demo } = await supabase.from("demos").select("*").eq("id", demoId).single();
    if (!demo) return res.status(404).json({ error: "Demo not found" });

    const prompt = `Analyze this business website and suggest modern redesign improvements.

Business: ${demo.business_name}
Website: ${demo.website_url}
Industry: ${demo.industry}
Current Summary: ${demo.site_summary}

Provide redesign recommendations using Framer Motion + Tailwind CSS:

1. HERO SECTION
   - Headline suggestion (benefit-focused)
   - Subheadline
   - CTA button text
   - Background style (gradient, image, video)
   - Animation suggestions (Framer Motion)

2. LAYOUT IMPROVEMENTS
   - Section order recommendation
   - Grid/flex layout suggestions
   - Spacing and typography improvements
   - Color palette (Tailwind classes)

3. CONVERSION OPTIMIZATIONS
   - Trust signals to add
   - Social proof placement
   - Form improvements
   - Mobile-first considerations

4. FRAMER MOTION ANIMATIONS
   - Scroll animations
   - Hover effects
   - Page transitions
   - Micro-interactions

5. TAILWIND COMPONENT SUGGESTIONS
   - Specific Tailwind utility classes
   - Component library recommendations
   - Responsive breakpoints

Return JSON: { hero, layout, conversion, animations, tailwind_components }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    let redesign;
    try {
      redesign = JSON.parse(content);
    } catch {
      redesign = {};
    }

    return res.status(200).json({ success: true, data: redesign });
  } catch (err) {
    console.error("Website redesign error:", err);
    return res.status(500).json({ 
      error: "Failed to generate redesign suggestions",
      details: err instanceof Error ? err.message : "Unknown error"
    });
  }
}
