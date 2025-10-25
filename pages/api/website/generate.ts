import { similaritySearch } from "@/lib/vector";
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
1. **Business Alignment**: Design must reflect the business's unique value proposition and positioning
2. **Conversion Focused**: Every section should guide visitors toward a specific action
3. **Modern UX**: Follow 2024 best practices for spacing, typography, and user flow
4. **Responsive**: Design must work beautifully on mobile, tablet, and desktop
5. **Accessible**: WCAG AA compliant color contrast and navigation

**TEMPLATE STYLE CHARACTERISTICS**:

**Modern Tech**: Clean, minimal, tech-forward
- Large whitespace, bold sans-serif typography
- Smooth scroll animations, parallax effects
- Glassmorphism, subtle gradients
- Best for: SaaS, tech services, modern agencies

**Classic Professional**: Timeless, trust-building
- Traditional grid layouts, serif headings
- Subtle animations, professional imagery
- Clear hierarchy, established credibility
- Best for: Law firms, finance, medical, B2B services

**Bold Statement**: High-contrast, attention-grabbing
- Large typography, vivid colors, dark backgrounds
- Dramatic animations, asymmetric layouts
- Creative, unexpected interactions
- Best for: Creative agencies, restaurants, retail, entertainment

**Minimal Elegance**: Ultra-clean, whitespace-focused
- Extreme simplicity, serif typography
- Subtle animations, lots of breathing room
- Monochromatic with accent color
- Best for: Luxury brands, design studios, high-end services

**Luxury Premium**: Sophisticated, high-end
- Gold/earth tones, elegant serif fonts
- Smooth, refined animations
- Premium imagery, exclusive feel
- Best for: Fine dining, spas, boutiques, premium services

**OUTPUT FORMAT**: Return valid JSON matching the WebsiteDesign interface. Include:

1. **Colors**: Specific hex codes appropriate for the style
2. **Sections**: Detailed content for hero, features (4-6), CTA, optional testimonials
3. **Animations**: Specific Framer Motion animation names for each element
4. **Suitability Score**: 0-100 score of how well this style fits the business with detailed reasons

**EXAMPLE OUTPUT** (Modern Tech for SaaS business):

{
  "id": "modern-tech-1",
  "name": "Modern Tech",
  "style": "modern",
  "description": "Clean, minimal design with bold typography and smooth animations for tech-forward SaaS businesses",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#1E40AF",
    "accent": "#F59E0B",
    "background": "#F9FAFB",
    "text": "#111827"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter"
  },
  "sections": {
    "hero": {
      "headline": "Streamline Your Workflow with AI-Powered Automation",
      "subheadline": "Save 20+ hours per week with intelligent task automation. Trusted by 10,000+ teams.",
      "ctaLabel": "Start Free Trial",
      "ctaAction": "/signup",
      "backgroundImage": "gradient-mesh-blue",
      "animation": "fadeInUp"
    },
    "features": [
      {
        "title": "Smart Automation",
        "description": "AI learns your workflows and automates repetitive tasks automatically",
        "icon": "⚡",
        "animation": "slideInLeft"
      },
      {
        "title": "Real-Time Collaboration",
        "description": "Work together seamlessly with your team across any device",
        "icon": "👥",
        "animation": "slideInRight"
      },
      {
        "title": "Enterprise Security",
        "description": "Bank-level encryption and SOC 2 compliance built-in",
        "icon": "🔒",
        "animation": "scaleIn"
      },
      {
        "title": "Advanced Analytics",
        "description": "Visualize productivity metrics and identify bottlenecks instantly",
        "icon": "📊",
        "animation": "fadeIn"
      }
    ],
    "cta": {
      "headline": "Ready to 10x Your Productivity?",
      "description": "Join thousands of teams already saving time with AI automation. Start your free 14-day trial today.",
      "ctaLabel": "Get Started Free",
      "animation": "slideInUp"
    }
  },
  "animations": {
    "pageEntry": "stagger",
    "scrollEffects": ["parallax", "fadeInOnScroll", "slideUpOnScroll"],
    "hoverEffects": ["scaleUp", "glow", "lift"]
  },
  "suitability": {
    "score": 95,
    "reasons": [
      "Modern tech aesthetic matches SaaS product positioning",
      "Clean design emphasizes product benefits over visual clutter",
      "Blue color palette signals trust and technology",
      "Smooth animations create premium feel without distraction"
    ]
  }
}

Be specific to the ACTUAL business. Use their real offerings, differentiators, and value propositions.`;

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

    // Get enriched context from vector database
    const query =
      "website design, visual identity, brand positioning, user experience";
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const vectorResults = await similaritySearch({
      demoId,
      queryEmbedding: embedding.data[0].embedding,
      topK: 8,
    });

    const businessContext = vectorResults
      .map((result: any) => result.content)
      .join("\n\n");

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

    const analysisContent = businessAnalysis.choices[0]?.message?.content || "{}";
    const cleanedAnalysis = analysisContent.replace(/```json\n?|```\n?/g, '').trim();
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
            content: `Generate a ${style} style website design for this business.

**BUSINESS CONTEXT**:
${demo.summary}

**ENRICHED INSIGHTS**:
${businessContext}

**KEY ITEMS**:
${JSON.stringify(demo.key_items, null, 2)}

**TEMPLATE STYLE**: ${template.name}
- ${template.description}
- Base colors: ${JSON.stringify(template.colors.base)}
- Typography: ${template.typography.heading} / ${template.typography.body}
- Animation types: ${template.animations.join(", ")}

Create a SPECIFIC design using ACTUAL business offerings and differentiators. Return valid JSON only.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) continue;

      try {
        const cleanedContent = content.replace(/```json\n?|```\n?/g, '').trim();
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

    // Sort by suitability score
    designs.sort((a, b) => b.suitability.score - a.suitability.score);

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
