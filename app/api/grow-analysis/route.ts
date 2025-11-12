import {
  augmentWithPorterContext,
  retrievePorterContext,
} from "@/lib/agents/porter-rag";
import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { MarketingIntelligenceCollector } from "@/lib/data-collectors/marketing-intelligence-collector";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { website, business_name, industry } = await request.json();

    if (!website || !business_name) {
      return NextResponse.json(
        { error: "Website and business name are required" },
        { status: 400 }
      );
    }

    // Get the strategic analysis agent (already registered in unified-agent-system)
    const agent = AgentRegistry.get("strategic-analysis");

    if (!agent) {
      throw new Error("Strategic analysis agent not found");
    }

    // CRITICAL: First collect ACTUAL website data before analysis
    console.log(`Collecting real website data from ${website}...`);
    const dataCollector = new MarketingIntelligenceCollector();
    let websiteData;
    try {
      websiteData = await dataCollector.collect(website);
      console.log(`✓ Collected data from ${website}`);
    } catch (error) {
      console.error(`Failed to collect website data:`, error);
      return NextResponse.json(
        { error: "Failed to fetch website data. Please check the URL and try again." },
        { status: 400 }
      );
    }

    // Retrieve Porter framework knowledge from vectors
    const businessContext = `${business_name} (${website}) in the ${industry} industry`;
    const porterContext = await retrievePorterContext(businessContext, "all");

    // Porter's 5 Forces analysis disguised as relatable questions
    const porterPrompt = `You are analyzing ${business_name} (${website}) in the ${industry} industry.

**ACTUAL WEBSITE DATA COLLECTED**:
Business Name: ${websiteData.brandAnalysis.businessName}
Tagline: ${websiteData.brandAnalysis.tagline || 'None'}
Headlines: ${websiteData.brandAnalysis.headlines.join(', ')}
Brand Tone: ${websiteData.brandAnalysis.tone}
Service Area: ${websiteData.competitiveSignals.serviceArea || 'Not specified'}
Years in Business: ${websiteData.competitiveSignals.yearsInBusiness || 'Not specified'}
Social Presence: ${Object.entries(websiteData.socialLinks).filter(([_, url]) => url).map(([platform]) => platform).join(', ') || 'None'}
Phone: ${websiteData.conversionAnalysis.phoneNumbers.join(', ') || 'Not found'}
CTAs: ${websiteData.conversionAnalysis.ctaButtons.join(', ')}
Content: ${websiteData.contentAnalysis.hasBlog ? `Has blog with ${websiteData.contentAnalysis.blogPostCount || 'unknown'} posts` : 'No blog'}
SEO: ${websiteData.seoData.metaTitle || 'No meta title'}

FULL WEBSITE INTELLIGENCE DATA:
${JSON.stringify(websiteData, null, 2)}

**CRITICAL INSTRUCTIONS - READ CAREFULLY**:
1. Use ONLY the actual data provided above from ${website}
2. The business name is "${websiteData.brandAnalysis.businessName}" NOT "${business_name}" (if different)
3. Reference their ACTUAL headlines, CTAs, and services from the data
4. **ABSOLUTELY FORBIDDEN**: Making up locations, services, or details not in the data
5. **REQUIRED**: Every answer MUST reference specific details from the WEBSITE DATA above
6. If a detail is "Not specified" or empty, say "not mentioned on website" - DO NOT invent it

**MANDATORY ANALYSIS**:

STEP 1 - Extract from the ACTUAL website data provided:
- Exact business classification based on their headlines: "${websiteData.brandAnalysis.headlines.join(', ')}"
- Specific products/services from their CTAs: "${websiteData.conversionAnalysis.ctaButtons.join(', ')}"
- Their location: ${websiteData.competitiveSignals.serviceArea || 'Must infer from content or say "not specified on website"'}
- What makes them unique from the brand analysis above
- Target customer segments based on their messaging tone: ${websiteData.brandAnalysis.tone}
- Years in business: ${websiteData.competitiveSignals.yearsInBusiness || 'not mentioned'}
- Any certifications: ${websiteData.competitiveSignals.awardsAndCertifications.join(', ') || 'none mentioned'}

STEP 2 - Competitive Analysis (Porter's 5 Forces in plain English):
For EACH force, you MUST:
- Name specific competitors when possible (e.g., "Ferrellgas, AmeriGas, and Superior Propane")
- Reference the business's ACTUAL services by name (e.g., "their subscription delivery service", "their LP tank exchange")
- Mention their actual location/market (e.g., "in the Phoenix East Valley", "in Austin metro")
- Include real barriers (regulatory requirements, capital costs, geographic coverage)
- Never use phrases like "competitors offer similar services" - be SPECIFIC about what those services are

STEP 3 - SWOT Analysis (in plain language):
- Strengths: List ONLY things you can verify from their website (years in business, service hours, coverage area, certifications, number of locations)
- Opportunities: Research what's actually working for top players in this EXACT industry (use industry knowledge)
- Threats: Name ACTUAL competitors and REAL trends (not "increased competition" - say WHO)
- Quick Wins: Actions that reference their SPECIFIC offerings (e.g., "Feature your 4hr emergency response time vs 24-48hr industry standard")

STEP 4 - Blue Ocean Strategy (Four Actions Framework):
Using the Four Actions Framework, identify how THIS business can break from competition and create uncontested market space:

**ELIMINATE** - What industry factors should THIS business stop competing on?
- Identify 2-3 SPECIFIC costly practices that ${industry} businesses do but THIS business's customers don't truly value
- Reference THEIR actual cost structure (e.g., "Your 2-truck operation can't profitably offer same-day delivery")
- Calculate REAL savings (e.g., "$15K/year in standby labor")
- FORBIDDEN: Generic like "eliminate traditional marketing" or "eliminate overhead"

**REDUCE** - What should THIS business reduce well below industry standard?
- Identify 2-3 SPECIFIC services they currently over-deliver on
- Reference what they ACTUALLY offer that could be scaled back (e.g., "Free equipment repair on all appliances")
- Show the benefit for THEIR business model (e.g., "Generates $8K/year in repair revenue")
- FORBIDDEN: "Reduce marketing spend" or "reduce product variety" without specifics

**RAISE** - What should THIS business raise well above industry standard?
- Identify 2-3 SPECIFIC differentiators from their website (e.g., "Your 4hr emergency response vs 24-48hr standard")
- Set measurable targets using THEIR actual capabilities (e.g., "Guarantee 2hr response leveraging your 4 local locations")
- Calculate REAL investment for their business size (e.g., "$5K for dispatch software")
- FORBIDDEN: "Raise brand awareness" or "raise quality" without naming their ACTUAL competitive advantages

**CREATE** - What should THIS business create that the industry has never offered?
- Identify 2-3 NEW innovations based on their ACTUAL unique position (e.g., "Price-lock subscription for propane")
- Explain why it's uncontested in THEIR specific market (e.g., "No Phoenix propane dealers offer price protection")
- Show feasibility for THEIR business (e.g., "Requires 25% volume growth to hedge pricing")
- FORBIDDEN: Generic "create loyalty program" or "create mobile app" - must be industry-first innovations

**VALUE PROPOSITION** - Uncontested market positioning:
- Define the SPECIFIC customer segment they're targeting (e.g., "Phoenix commercial customers who can't afford downtime")
- Reference THEIR actual differentiators (e.g., "4hr response, subscription pricing, 4 exchange locations")
- Show how this creates uncontested space (e.g., "No competitor combines all three benefits")

Return this EXACT JSON format:
{
  "business_name": "${business_name}",
  "website": "${website}",
  "exact_sub_niche": "SPECIFIC sub-niche classification (e.g., '24/7 emergency propane delivery service in Phoenix East Valley' NOT 'propane company')",
  "location_context": "Their actual service area and geographic advantages/challenges",
  "what_makes_you_different": [
    "List 3-5 SPECIFIC competitive advantages referencing their ACTUAL services, credentials, or methods",
    "Example: 'Only 24/7 emergency delivery in East Valley with 4hr average response time'",
    "Example: 'Competition-grade BBQ (3x state champion) with corporate catering focus'",
    "NOT generic things like 'great customer service' or 'quality products'"
  ],
  "why_customers_choose_competitors": [
    {
      "question": "Can customers easily switch to competitors?",
      "insight": "MUST NAME specific competitors (e.g., 'Customers can switch to Ferrellgas or AmeriGas who also serve Phoenix'). Reference THIS business's actual retention mechanism (e.g., 'However, your subscription auto-delivery service reduces switching by eliminating the need to call for refills'). Include REAL switching barriers specific to their industry (e.g., 'Tank ownership, equipment installation costs, contract terms'). FORBIDDEN: 'low switching costs', 'similar services offered by competitors'",
      "action": "Concrete action using their ACTUAL services by name (e.g., 'Add a tank exchange loyalty program - customers who exchange 10 times get their 11th free, leveraging your 4 retail locations vs delivery-only competitors'). Include WHY this works for their specific business model."
    },
    {
      "question": "Are new competitors entering your market?",
      "insight": "Name SPECIFIC barriers to entry in ${industry} (e.g., 'New propane dealers need $200K+ for delivery trucks, DOT licensing, insurance, and tank inventory' OR 'New BBQ caterers need commercial kitchen permits, health inspections, and bulk meat supplier relationships'). Reference their ACTUAL competitive moat (e.g., 'Your 15 years of local relationships and 4 exchange locations create high barrier' OR 'Your state championship credentials and 14-hour smoking process are hard to replicate'). FORBIDDEN: 'moderate barriers', 'growing market'",
      "action": "Specific defensive action using their actual position (e.g., 'Lock in commercial customers with annual propane contracts at your current 4 locations before new entrants target them' OR 'Secure exclusive catering rights with top corporate venues using your championship BBQ credentials')"
    },
    {
      "question": "How much power do your suppliers have?",
      "insight": "Name the ACTUAL suppliers in ${industry} (e.g., 'Propane sourcing from regional terminals like Targa Resources or Enterprise Products' OR 'Meat suppliers like Restaurant Depot or US Foods for bulk brisket'). Analyze based on THIS business's actual needs (e.g., 'Your 24/7 emergency service requires reliable supply - you need backup terminals' OR 'Your competition-grade BBQ requires premium cuts - you're locked into specialty suppliers'). FORBIDDEN: 'supplier power is moderate', 'some vendor lock-in'",
      "action": "Specific action for their business (e.g., 'Establish contracts with 2-3 propane terminals for your emergency service to avoid single-source risk' OR 'Negotiate bulk pricing with your brisket supplier by guaranteeing monthly volume from catering bookings')"
    },
    {
      "question": "How much power do your customers have?",
      "insight": "Analyze THEIR SPECIFIC customer segments by name (e.g., 'Your residential tank customers are less price-sensitive due to switching costs, but your commercial forklift exchange customers compare quotes' OR 'Corporate BBQ catering clients request 3+ bids, but game-day orders are impulse buys'). Reference THEIR ACTUAL market (e.g., 'In Phoenix East Valley, 5+ propane providers compete for commercial accounts' OR 'Austin has 20+ BBQ caterers - differentiation is critical'). FORBIDDEN: 'customers are price-sensitive', 'high bargaining power'",
      "action": "Specific value-add using their ACTUAL differentiators (e.g., 'Bundle your 24/7 emergency service with commercial contracts - competitors can't match response time' OR 'Offer BBQ tasting packages for corporate clients - your championship credentials justify premium pricing')"
    },
    {
      "question": "What alternatives do customers have?",
      "insight": "Name SPECIFIC substitutes for their actual services (e.g., 'Residential heating: electric heat pumps ($5K install), natural gas lines ($3K hookup), or solar+battery systems' OR 'Corporate catering: BBQ chains like Dickey's or Rudy's, Mexican catering, or sandwich platters from Potbelly'). Compare THEIR SPECIFIC value prop (e.g., 'Propane heating is 30% cheaper than electric in Phoenix winters - emphasize cost savings' OR 'Your smoke-ring brisket quality beats chain BBQ - showcase award photos'). FORBIDDEN: 'alternatives exist', 'propane is preferred'",
      "action": "Differentiation using their ACTUAL unique features (e.g., 'Create comparison calculator on your website: propane heating cost vs electric for Phoenix homes - prove your value' OR 'Post Instagram videos of your 14-hour smoking process vs Dickey's reheated meat - educate on quality difference')"
    }
  ],
  "your_strengths": [
    "4-6 SPECIFIC strengths based on their actual offerings",
    "Reference real services, credentials, years in business, geographic coverage",
    "Example: '4 retail locations for tank exchange vs delivery-only competitors'",
    "Example: '14-hour smoking process creates competition-grade brisket with smoke rings'"
  ],
  "opportunities": [
    "4-6 SPECIFIC growth opportunities for THIS business type in their market",
    "Reference what successful competitors in their category emphasize",
    "Include specific metrics where possible (e.g., 'BBQ caterers see 40-60% revenue from online advance orders')",
    "Example: 'Add online ordering for your signature catering packages - capture game day and corporate event bookings'"
  ],
  "threats_to_watch": [
    "3-5 external challenges specific to ${industry} in their location",
    "Reference actual market trends, regulatory changes, or competitive moves",
    "Example: 'Big chains like [competitor] expanding into Phoenix East Valley'",
    "Example: 'Rising propane costs putting pressure on delivery margins'"
  ],
  "quick_wins": [
    {
      "title": "SPECIFIC action using their actual services (e.g., 'Feature your LP tank exchange pricing ($25) prominently')",
      "why": "Why THIS matters for their specific business and competitive position",
      "action": "Exact steps referencing their actual website, services, or market position",
      "difficulty": "easy|medium|advanced",
      "estimated_impact": "Quantified potential result specific to their industry"
    }
  ],
  "blue_ocean_strategy": {
    "eliminate": [
      {
        "factor": "SPECIFIC industry standard that THIS business should stop competing on (e.g., 'Same-day delivery promises that require 3+ trucks on standby' OR '24/7 phone support requiring night staff')",
        "rationale": "Why THIS business specifically should eliminate it - reference their ACTUAL cost structure or operational model (e.g., 'Your 2-truck operation can't profitably staff same-day - focus on scheduled delivery with price advantage' OR 'Your solo operation wastes $40K/year on answering service - use automated booking instead')",
        "cost_savings": "REAL estimated savings for their business size (e.g., '$15K/year in standby labor' OR '$40K/year in answering service + staff time')",
        "forbidden": "DO NOT say: 'eliminate traditional marketing', 'eliminate physical locations', 'eliminate expensive overhead' - be SPECIFIC to their industry"
      }
    ],
    "reduce": [
      {
        "factor": "SPECIFIC feature THIS business over-delivers on (e.g., 'Free equipment repair service on propane appliances' OR 'Custom BBQ rub recipes for every catering order')",
        "new_level": "Exactly how to scale it back (e.g., 'Charge $50 for appliance repairs, offer free diagnostics only' OR 'Signature rub on premium packages only, standard rub for basic catering')",
        "benefit": "What THIS business gains specifically (e.g., 'Generates $8K/year in repair revenue while maintaining convenience value prop' OR 'Reduces custom rub costs 40% while preserving championship BBQ positioning for high-margin orders')",
        "forbidden": "DO NOT say: 'reduce customer service quality', 'reduce product variety', 'reduce marketing spend' - be SPECIFIC to services they actually offer"
      }
    ],
    "raise": [
      {
        "factor": "SPECIFIC differentiator THIS business should amplify (e.g., 'Your 4hr emergency response time vs 24-48hr industry standard' OR 'Your competition-grade brisket with smoke rings vs chain BBQ reheated meat')",
        "target_level": "Measurable goal using their ACTUAL capability (e.g., 'Guarantee 2hr response for premium emergency service tier - leveraging your local 4-location network' OR 'Showcase 14-hour smoking process in Instagram Reels - 3 posts/week showing smoke ring quality vs Dickey's')",
        "investment": "REAL cost for their business size (e.g., '$5K for emergency dispatch software + $200/month on-call premium' OR '$0 cost - repurpose smoking prep time into content creation, 2hrs/week')",
        "forbidden": "DO NOT say: 'raise brand awareness', 'raise customer satisfaction', 'raise quality standards' - reference their ACTUAL competitive advantages by name"
      }
    ],
    "create": [
      {
        "innovation": "NEW value factor based on THIS business's unique position (e.g., 'Propane price-lock subscription: customers pay fixed $/gallon for 12 months regardless of market fluctuations' OR 'BBQ catering with live smoking station: bring championship smoker to corporate events for fresh-carved brisket')",
        "value_proposition": "Why THIS is uncontested for their specific market (e.g., 'No Phoenix propane dealers offer price protection - eliminates customer anxiety about winter price spikes, creates predictable revenue' OR 'Austin BBQ caterers deliver pre-cooked food - live smoking creates event experience, justifies 2x pricing')",
        "feasibility": "Implementation reality for their ACTUAL business (e.g., 'Requires hedging 10K gallons/month with supplier - your current 8K/month volume needs 25% growth first' OR 'Mobile smoker trailer: $8K investment, book 2 events/month at +$500 premium to break even in 8 months')",
        "forbidden": "DO NOT say: 'create loyalty program', 'create mobile app', 'create social media presence' - must be innovations their industry has NEVER offered"
      }
    ],
    "value_proposition": "THIS business's unique positioning in uncontested market space - MUST reference their ACTUAL differentiators and the specific customer segment they're creating value for (e.g., 'Emergency propane provider for Phoenix commercial customers who can't afford downtime - 4hr response beats all competitors, subscription pricing eliminates budget surprises' OR 'Championship-quality BBQ for Austin corporate events that want wow-factor live entertainment - 14hr smoked brisket quality at event creates Instagram moments, justifies premium over pre-made catering')"
  }
}

**EXAMPLES OF GOOD vs BAD**:

❌ ABSOLUTELY FORBIDDEN (Generic boilerplate):
- "Customers can easily switch due to low switching costs in the industry"
- "The market is growing rapidly with new competitors entering"
- "Supplier power is moderate with some vendor lock-in"
- "Customers are price-sensitive and compare quotes"
- "Alternatives include other providers in the space"
- "Improve online presence"
- "Great customer service"
- "Competitive pricing"
- "Build brand awareness"
- "Eliminate traditional marketing" (Blue Ocean)
- "Create loyalty program" (Blue Ocean)
- "Raise quality standards" (Blue Ocean)

✅ REQUIRED (Specific to actual business with NAMES and NUMBERS):

**Porter's Five Forces Examples:**
- "Customers can switch to Ferrellgas (3 locations) or AmeriGas (5 locations) in Phoenix, BUT your subscription auto-delivery prevents the hassle of calling for refills - 73% of subscription customers stay 3+ years vs 40% for call-in customers"
- "New propane dealers face $200K+ startup costs (trucks, DOT licensing, insurance, tank inventory) plus Phoenix requires hazmat certification - your 15 years and 4 exchange locations create high barrier"
- "Propane sourcing from Targa Resources terminal in Buckeye - backup needed from Enterprise Products terminal in Chandler for your 24/7 emergency service reliability"
- "Your residential propane customers rarely compare prices (high switching cost due to tank ownership), but your commercial forklift cylinder exchange customers get 3+ quotes - separate pricing strategy needed"
- "Residential heating alternatives: electric heat pumps ($5K install), natural gas hookup ($3K), solar+battery ($15K) - propane is 30% cheaper than electric in Phoenix winters, emphasize this in marketing"

**Blue Ocean Four Actions Examples:**
- **ELIMINATE**: "Stop competing on same-day delivery promises - requires keeping 3+ trucks on standby. Your 2-truck operation can't profitably staff it. Focus on scheduled delivery with 20% price advantage. Saves $15K/year in standby labor."
- **REDUCE**: "Scale back free equipment repair on all propane appliances. Charge $50 for repairs, offer free diagnostics only. Generates $8K/year in repair revenue while maintaining convenience value prop vs delivery-only competitors."
- **RAISE**: "Amplify your 4hr emergency response time vs 24-48hr industry standard. Guarantee 2hr response for premium tier, leveraging your 4 local exchange locations. Investment: $5K dispatch software + $200/month on-call premium."
- **CREATE**: "Propane price-lock subscription - customers pay fixed $/gallon for 12 months regardless of market fluctuations. No Phoenix dealers offer price protection. Eliminates customer anxiety about winter spikes. Requires hedging 10K gallons/month - your 8K/month volume needs 25% growth first."
- **VALUE PROPOSITION**: "Emergency propane provider for Phoenix commercial customers who can't afford downtime - 4hr response beats all competitors, subscription pricing eliminates budget surprises, 4 exchange locations provide backup options."

**Blue Ocean BBQ Catering Example:**
- **ELIMINATE**: "Stop offering 24/7 phone support requiring night staff. Your solo catering operation wastes $40K/year on answering service. Use automated online booking with next-day confirmation. Saves $40K/year."
- **REDUCE**: "Custom BBQ rub recipes for every order. Offer signature championship rub on premium packages only, standard rub for basic catering. Reduces custom rub costs 40% while preserving championship positioning for high-margin corporate events."
- **RAISE**: "Your competition-grade brisket with smoke rings vs Dickey's reheated meat. Showcase 14-hour smoking process in Instagram Reels - 3 posts/week showing smoke ring quality. $0 cost - repurpose smoking prep time into content, 2hrs/week."
- **CREATE**: "Live smoking station at corporate events - bring championship smoker trailer for fresh-carved brisket on-site. Austin caterers deliver pre-cooked food. Live smoking creates event experience, justifies 2x pricing. Mobile trailer: $8K investment, book 2 events/month at +$500 premium = break even in 8 months."
- **VALUE PROPOSITION**: "Championship-quality BBQ for Austin corporate events wanting wow-factor live entertainment - 14hr smoked brisket quality creates Instagram moments, live carving station justifies premium over pre-made catering from Dickey's or Rudy's."

**FORMAT REQUIREMENT**:
Every "insight" field MUST include:
1. Named competitors or alternatives (e.g., "Ferrellgas, AmeriGas" NOT "competitors")
2. Specific numbers or metrics (e.g., "$200K startup", "4hr response", "3+ locations")
3. THIS business's actual service/feature by name (e.g., "your subscription auto-delivery", "your 4 exchange locations")
4. Comparison or positioning (e.g., "vs 24-48hr industry standard", "unlike delivery-only competitors")

Every "action" field MUST include:
1. Specific service/feature from their website (e.g., "your 24/7 emergency service", "your championship wins")
2. Concrete implementation steps (e.g., "Feature on homepage banner", "Add to catering packages")
3. Expected outcome with reasoning (e.g., "wins urgent commercial accounts", "justifies premium pricing")

Analyze THEIR actual business. Show them you understand THEIR specific market position better than they do.`;

    // Augment the prompt with Porter framework context from vectors
    const augmentedPrompt = augmentWithPorterContext(
      porterPrompt,
      porterContext
    );

    const response = await agent.execute(augmentedPrompt);

    // Parse the response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let content = response.content;
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
          // Fix control characters and malformed JSON
          let cleaned = jsonMatch[0]
            .replace(/,(\s*[}\]])/g, "$1")
            .replace(/\/\/.*/g, "")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/"([^"]*)"/g, (match, str) => {
              return '"' + str
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t')
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '') + '"';
            });
          analysis = JSON.parse(cleaned);
        }
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI Response content:", response.content);
      // Return error instead of fallback template
      return NextResponse.json(
        {
          error:
            "Unable to analyze business. The AI response could not be parsed. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Grow analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze business" },
      { status: 500 }
    );
  }
}
