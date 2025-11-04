import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface WebsiteDesign {
  id: string;
  name: string;
  style: "modern" | "classic" | "bold" | "minimal" | "luxury";
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  sections: {
    hero: {
      headline: string;
      subheadline: string;
      ctaLabel: string;
      ctaAction: string;
      backgroundImage: string;
      animation: string;
    };
    features: Array<{
      title: string;
      description: string;
      icon: string;
      animation: string;
    }>;
    cta: {
      headline: string;
      description: string;
      ctaLabel: string;
      animation: string;
    };
    testimonials?: Array<{
      quote: string;
      author: string;
      role: string;
      animation: string;
    }>;
  };
  animations: {
    pageEntry: string;
    scrollEffects: string[];
    hoverEffects: string[];
  };
  suitability: {
    score: number;
    reasons: string[];
  };
}

const DESIGN_TEMPLATES = {
  modern: {
    name: "Modern Tech",
    description:
      "Clean, minimal design with bold typography and smooth animations. Perfect for tech-forward businesses.",
    colors: {
      base: {
        primary: "#3B82F6",
        secondary: "#1E40AF",
        accent: "#F59E0B",
        background: "#F9FAFB",
        text: "#111827",
      },
    },
    typography: { heading: "Inter", body: "Inter" },
    animations: ["fadeIn", "slideUp", "scaleIn", "parallax"],
  },
  classic: {
    name: "Classic Professional",
    description:
      "Timeless, trust-building design with traditional layouts. Ideal for established businesses.",
    colors: {
      base: {
        primary: "#1F2937",
        secondary: "#4B5563",
        accent: "#DC2626",
        background: "#FFFFFF",
        text: "#1F2937",
      },
    },
    typography: { heading: "Merriweather", body: "Open Sans" },
    animations: ["fadeIn", "slideRight", "rotateIn"],
  },
  bold: {
    name: "Bold Statement",
    description:
      "High-contrast, attention-grabbing design with large elements. Perfect for creative businesses.",
    colors: {
      base: {
        primary: "#DC2626",
        secondary: "#991B1B",
        accent: "#FBBF24",
        background: "#111827",
        text: "#F9FAFB",
      },
    },
    typography: { heading: "Poppins", body: "Roboto" },
    animations: ["bounce", "pulse", "wiggle", "zoom"],
  },
  minimal: {
    name: "Minimal Elegance",
    description:
      "Ultra-clean, whitespace-focused design. Best for luxury or design-focused brands.",
    colors: {
      base: {
        primary: "#0F172A",
        secondary: "#475569",
        accent: "#14B8A6",
        background: "#FFFFFF",
        text: "#0F172A",
      },
    },
    typography: { heading: "Playfair Display", body: "Lato" },
    animations: ["fadeIn", "slideUp", "subtle"],
  },
  luxury: {
    name: "Luxury Premium",
    description:
      "Sophisticated, high-end design with elegant animations. Perfect for premium services.",
    colors: {
      base: {
        primary: "#854D0E",
        secondary: "#78350F",
        accent: "#F59E0B",
        background: "#FFFBEB",
        text: "#78350F",
      },
    },
    typography: { heading: "Cormorant Garamond", body: "Raleway" },
    animations: ["fadeIn", "elegant", "glide", "shimmer"],
  },
};

const WEBSITE_GENERATION_PROMPT = `You are an expert web designer creating PRODUCTION-READY website designs with detailed specifications for implementation.

**CRITICAL REQUIREMENTS**:
1. **Business Alignment**: Design MUST reflect THIS SPECIFIC BUSINESS's unique value proposition, industry, and positioning - NOT generic template defaults
2. **Conversion Focused**: Every section should guide visitors toward a specific action relevant to THIS BUSINESS
3. **Modern UX**: Follow 2024 best practices for spacing, typography, and user flow
4. **Responsive**: Design must work beautifully on mobile, tablet, and desktop
5. **Accessible**: WCAG AA compliant color contrast and navigation

**ABSOLUTELY MANDATORY - BUSINESS CUSTOMIZATION**:
- Analyze the business's actual industry (home remodeling? restaurant? HVAC? legal? etc.)
- Use industry-appropriate colors (construction: oranges/browns/grays, healthcare: blues/greens, food: warm reds/yellows, legal: navy/burgundy, etc.)
- Write headlines and content specific to THEIR services, NOT generic template filler
- Choose design name that reflects THEIR business type (e.g., "Professional Contractor Showcase" NOT "Modern Tech")
- Features section must list THEIR actual services/offerings, NOT generic benefits
- CTA must match THEIR conversion goal (consultation, reservation, quote, appointment, etc.)

**TEMPLATE STYLE CHARACTERISTICS** (adapt these to the actual business):

**Modern**: Clean, minimal design style
- Large whitespace, bold sans-serif typography
- Smooth scroll animations, parallax effects
- Contemporary feel with professional polish

**Classic**: Timeless, trust-building design style
- Traditional grid layouts, serif headings
- Subtle animations, professional imagery
- Clear hierarchy, established credibility

**Bold**: High-contrast, attention-grabbing design style
- Large typography, vivid colors
- Dramatic animations, asymmetric layouts
- Creative, unexpected interactions

**Minimal**: Ultra-clean, whitespace-focused design style
- Extreme simplicity, elegant typography
- Subtle animations, lots of breathing room
- Monochromatic with single accent color

**Luxury**: Sophisticated, high-end design style
- Rich colors, elegant fonts
- Smooth, refined animations
- Premium feel, exclusive atmosphere

**INDUSTRY-SPECIFIC EXAMPLES**:

Home Remodeling/Construction:
- Design name: "Professional Contractor Showcase" or "Renovation Portfolio"
- Colors: Warm oranges (#FF6B35), construction browns (#5C4033), professional grays (#4A5568)
- Hero: "Transform Your Home with Expert Craftsmanship" + before/after imagery
- Features: Kitchen Remodeling, Bathroom Renovations, Home Additions, Custom Carpentry
- CTA: "Get Free Consultation" or "Request Quote"

Restaurant/Food Service:
- Design name: "Culinary Experience Gallery" or "Restaurant Showcase"
- Colors: Appetizing reds (#DC2626), warm yellows (#FBBF24), elegant blacks
- Hero: Restaurant name + signature dish imagery + reservation button
- Features: Menu highlights, Chef's specials, Catering, Private events
- CTA: "Make Reservation" or "Order Online"

Professional Services (Legal/Medical/Financial):
- Design name: "Trust & Expertise Professional" or "Client-Focused Practice"
- Colors: Trustworthy navy (#1E3A8A), professional burgundy (#7C2D12), clean whites
- Hero: "Protecting Your [Rights/Health/Future]" + credentials
- Features: Practice areas, Team expertise, Client success stories, Free consultation
- CTA: "Schedule Consultation" or "Speak with Specialist"

HVAC/Home Services:
- Design name: "Reliable Service Professionals" or "24/7 Home Comfort"
- Colors: Cool blues (#3B82F6), reliable greens (#10B981), warning oranges
- Hero: "Fast, Professional [Service Type]" + emergency availability
- Features: Installation, Repair, Maintenance, Emergency Service
- CTA: "Call Now" or "Book Service"

**OUTPUT FORMAT**: Return valid JSON matching the WebsiteDesign interface. Include:

1. **Name**: MUST reflect actual business industry (NOT "Modern Tech" or generic template names)
2. **Description**: MUST describe how design fits THIS SPECIFIC BUSINESS
3. **Colors**: Industry-appropriate hex codes matching the business type
4. **Sections**: Detailed content using THEIR actual services and value propositions
5. **Animations**: Specific Framer Motion animation names appropriate for the content
6. **Suitability Score**: 0-100 score of how well this style fits THIS SPECIFIC BUSINESS with detailed reasons

**CRITICAL FINAL INSTRUCTION**: 
Before generating the design, identify the business's industry from their summary. Then create a design that would make sense ONLY for that specific industry. A home remodeling company should get construction-focused designs, a restaurant should get food-focused designs, etc. NEVER generate generic "Modern Tech" or "SaaS" content unless the business is actually a tech/SaaS company.

Return ONLY valid JSON - no markdown code blocks, no explanations.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.body;

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Demo ID required" });
  }

  try {
    // Get demo data
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("summary, insights, key_items, site_url")
      .eq("id", demoId)
      .single();

    if (demoError) throw demoError;
    if (!demo) return res.status(404).json({ error: "Demo not found" });

    // Use demo data as business context
    const businessContext = `${demo.summary}\n\nKey Items: ${JSON.stringify(demo.key_items)}\n\nInsights: ${JSON.stringify(demo.insights)}`;

    // Analyze business type to determine best-fit templates
    const businessAnalysis = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analyze this business and determine which design styles would work best. Return JSON with:
{
  "businessType": "specific sub-niche",
  "valueProps": ["unique differentiator 1", "differentiator 2"],
  "targetAudience": "specific audience description",
  "recommendedStyles": ["style1", "style2", "style3"]
}

Choose from: modern, classic, bold, minimal, luxury`,
        },
        {
          role: "user",
          content: `${demo.summary}\n\nKey Items: ${JSON.stringify(demo.key_items)}\n\nInsights: ${JSON.stringify(demo.insights)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysisContent =
      businessAnalysis.choices[0]?.message?.content || "{}";
    const cleanedAnalysis = analysisContent
      .replace(/```json\n?|```\n?/g, "")
      .trim();
    const analysis = JSON.parse(cleanedAnalysis);
    const recommendedStyles = analysis.recommendedStyles || [
      "modern",
      "classic",
      "minimal",
    ];

    // Generate 3 website designs based on recommended styles
    const designs: WebsiteDesign[] = [];

    for (const style of recommendedStyles.slice(0, 3)) {
      const template = DESIGN_TEMPLATES[style as keyof typeof DESIGN_TEMPLATES];
      if (!template) continue;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: WEBSITE_GENERATION_PROMPT },
          {
            role: "user",
            content: `You MUST create a website design specifically for THIS business's industry and services. DO NOT use generic tech/SaaS content.

**ACTUAL BUSINESS TO DESIGN FOR**:
${demo.summary}

**ADDITIONAL CONTEXT**:
${businessContext}

**KEY SERVICES/OFFERINGS**:
${JSON.stringify(demo.key_items, null, 2)}

**DESIGN STYLE TO APPLY**: ${style} (${template.name})
Use this style approach: ${template.description}
Suggested color palette direction: ${JSON.stringify(template.colors.base)}
Suggested fonts: ${template.typography.heading} / ${template.typography.body}
Animation approach: ${template.animations.join(", ")}

**MANDATORY REQUIREMENTS**:
1. Design name must reflect THIS business's industry (e.g., "Professional Contractor Portfolio" for construction, "Culinary Showcase" for restaurants)
2. Hero headline must use THIS business's actual value proposition
3. Features must list THIS business's actual services
4. Colors must match THIS business's industry (construction: oranges/browns, healthcare: blues/greens, food: warm reds/yellows, legal: navy/burgundy)
5. CTA must match THIS business's conversion goal (quote, reservation, consultation, appointment)

Read the business summary carefully. If it's home remodeling, create a construction-focused design. If it's a restaurant, create a food-focused design. DO NOT default to "Modern Tech" or generic SaaS content.

Return ONLY valid JSON matching the WebsiteDesign interface - no markdown, no explanations.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) continue;

      try {
        const cleanedContent = content.replace(/```json\n?|```\n?/g, "").trim();
        const design = JSON.parse(cleanedContent) as WebsiteDesign;
        design.id = `${style}-${Date.now()}-${designs.length}`;
        designs.push(design);
      } catch (parseError) {
        console.error(`Failed to parse design JSON for ${style}:`, parseError);
        continue;
      }
    }

    if (designs.length === 0) {
      throw new Error("Failed to generate any valid designs");
    }

    // Sort by suitability score (with fallback for missing scores)
    designs.sort((a, b) => {
      const scoreA = a.suitability?.score || 0;
      const scoreB = b.suitability?.score || 0;
      return scoreB - scoreA;
    });

    return res.status(200).json({
      success: true,
      designs,
      analysis: {
        businessType: analysis.businessType,
        targetAudience: analysis.targetAudience,
        recommendedStyles: analysis.recommendedStyles,
      },
    });
  } catch (error) {
    console.error("Error generating website designs:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate website designs" });
  }
}
