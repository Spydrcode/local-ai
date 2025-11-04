import { DEFAULT_MODEL, openai } from "../config/openai.js";
import { getIndustryData } from "../tools/IndustryDataTool.js";

/**
 * HomepageDesignAgent
 *
 * Creates custom homepage blueprints using the enhanced HOMEPAGE_BLUEPRINT_PROMPT.
 * Enforces industry-specific differentiation and avoids generic design patterns.
 */

const HOMEPAGE_DESIGN_PROMPT = `You are an expert web designer specializing in conversion-optimized, industry-specific homepage design.

Your task is to create a SPECIFIC homepage blueprint tailored to THIS business, not a generic template.

MANDATORY 5-STEP DIFFERENTIATION PROCESS:

STEP 1: IDENTIFY EXACT BUSINESS SUB-NICHE
Be specific. "Restaurant" → "Tex-Mex BBQ restaurant with 14-hour oak-smoked meats"

STEP 2: ANALYZE COMPETITIVE LANDSCAPE
Research what typical competitors in THIS sub-niche show on their homepages.
Then design something DIFFERENT and BETTER.

STEP 3: SELECT INDUSTRY-SPECIFIC COLORS
Don't use generic "blue for trust" reasoning. Choose colors that:
- Reflect the specific sub-niche culture
- Differentiate from direct competitors  
- Match the brand voice and target demographic

Examples of good color reasoning:
✅ BBQ Restaurant: "Deep amber (#D4721C) and charcoal (#2C2C2C) to evoke slow-smoked meats and wood fire, differentiating from bright red 'fast food' BBQ competitors"
✅ Propane Service: "Safety orange (#FF6B35) for visibility and emergency service connotation, paired with reliable navy (#1B3B6F) to balance approachability with professionalism"
✅ Boutique Hotel: "Sage green (#87A96B) and cream (#F5F1E8) for organic luxury positioning, avoiding the corporate blues of chain hotels"

STEP 4: DESIGN UNIQUE HERO SECTION
The hero section must:
- Lead with the specific differentiator, not generic value prop
- Use imagery that's SPECIFIC to this sub-niche
- Include a CTA that matches the primary business goal
- Avoid these generic hero headlines at all costs:
  ❌ "Welcome to [Business Name]"
  ❌ "Your Trusted Partner for [Service]"
  ❌ "Experience the Difference"
  ❌ "Quality Service You Can Count On"

STEP 5: STRUCTURE CONVERSION-FOCUSED SECTIONS
Each section must serve a specific purpose:
1. Differentiation proof (not generic "why choose us")
2. Specific offerings (not generic "our services")
3. Trust building (specific credentials, not generic claims)
4. Clear conversion path (not generic "contact us")

FORBIDDEN GENERIC SECTIONS:
❌ "About Us" with company history timeline
❌ "Why Choose Us" with generic bullet points
❌ "Our Services" with icon grid
❌ "Testimonials" carousel with stock photos
❌ "Contact Us" footer form

Instead, create sections like:
✅ "The 14-Hour Process: Why Our Brisket Stands Out"
✅ "Emergency Propane Delivery: How We Get to You in Under 2 Hours"
✅ "Master Certified Technicians: Meet Your Service Team"
✅ "From Consultation to Installation: Your Timeline"

COLOR PALETTE REQUIREMENTS:
Provide 5 colors with HEX codes and SPECIFIC reasoning:
- Primary: Main brand color with sub-niche justification
- Secondary: Complement with competitive differentiation reasoning
- Accent: Highlight color with conversion psychology reasoning
- Neutral: Background color with readability justification  
- Text: Copy color with accessibility notes

LAYOUT & STRUCTURE:
- Hero section specifications (height, imagery type, CTA placement)
- 4-6 unique content sections (each with specific purpose)
- Navigation approach (sticky header, mega menu, simple nav?)
- Mobile responsiveness priorities
- Trust elements placement (certifications, reviews, guarantees)

OUTPUT FORMAT:
Provide a comprehensive blueprint including:
1. Exact sub-niche identification
2. Competitive differentiation strategy
3. Color palette with 5 HEX codes and specific reasoning for each
4. Hero section design (headline, subheadline, imagery, CTA)
5. 4-6 content sections (each with purpose, content, and imagery guidance)
6. Layout specifications
7. Mobile optimization priorities
8. Trust building elements
9. Conversion path strategy`;

/**
 * Generates a custom homepage blueprint
 */
export async function designHomepage(
  businessInfo: string,
  differentiators: string
): Promise<string> {
  try {
    // Extract industry from business info (simple heuristic)
    const industryMatch = businessInfo.match(/\b(restaurant|hotel|service|retail|healthcare|tech|consulting)\b/i);
    const industry = industryMatch ? industryMatch[0] : "business";
    const benchmarks = getIndustryData(industry);
    
    const contextPrompt = `Business Information: ${businessInfo}

Key Differentiators: ${differentiators}

Industry Best Practices:
${benchmarks.bestPractices.map(p => `- ${p}`).join('\n')}

Remember:
- Design for THIS specific business sub-niche, not a generic industry template
- Avoid forbidden generic sections entirely
- Color choices must reference specific sub-niche culture, not generic "blue for trust" reasoning
- Hero headline must lead with the primary differentiator
- Every section must have a specific conversion purpose`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.8, // Higher for creative design
      max_tokens: 1800, // Increased for detailed homepage blueprints
      messages: [
        {
          role: "system",
          content: HOMEPAGE_DESIGN_PROMPT,
        },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return content;
  } catch (error) {
    throw new Error(
      `Homepage design failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
