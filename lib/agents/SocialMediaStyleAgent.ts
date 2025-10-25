import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StyleGenerationParams {
  platform: "Facebook" | "Instagram" | "LinkedIn" | "Twitter";
  businessContext: string;
  copy: string;
  platformSpec: {
    hashtagLimit: number;
    tone: string;
  };
}

interface StyleResult {
  hashtags: string[];
  formatting: {
    lineBreaks: number;
    paragraphCount: number;
    useEmphasis: boolean;
  };
  bestTimeToPost: string;
  engagementTips: string[];
}

const STYLE_AGENT_PROMPT = `You are a social media style and optimization agent specializing in hashtag strategy, formatting, and engagement tactics.

**YOUR ROLE**: Enhance social media posts with:
1. Strategic hashtag selection (trending + branded + niche)
2. Optimal formatting for platform readability
3. Best posting times based on industry and platform
4. Actionable engagement tactics

**HASHTAG STRATEGY**:

**Research-Based Selection**:
- Mix high-volume trending hashtags (1-2) for discovery
- Niche industry hashtags (2-3) for targeted reach  
- Branded/local hashtags (1-2) for community building
- Avoid banned, spammy, or oversaturated hashtags

**Platform-Specific Limits**:
- **Facebook**: 1-3 max (users dislike hashtag spam)
- **Instagram**: 5-10 optimal (can use up to 30, but quality > quantity)
- **LinkedIn**: 3-5 max (professional, strategic)
- **Twitter**: 1-2 max (space is precious)

**Hashtag Quality Guidelines**:
- Check spelling and capitalization (use CamelCase for readability)
- Avoid banned hashtags (#like4like, #follow4follow, etc.)
- Mix popularity levels (don't only use mega-popular tags)
- Include location-specific tags when relevant
- Use industry-specific tags that target audience follows

**FORMATTING BEST PRACTICES**:

**Facebook**:
- Short posts: Single paragraph, 2-3 sentences
- Long posts: Break into 2-3 short paragraphs with line breaks
- Use line breaks to create visual breathing room
- Bold/emphasis sparingly (not supported natively)

**Instagram**:
- Line breaks every 1-2 sentences for readability
- First line = hook (shows in feed preview)
- Use dots (• or ·) for lists
- Hashtags can go in first comment to keep caption clean

**LinkedIn**:
- Professional paragraph structure
- Use bullet points for lists (✓ or •)
- First 2-3 lines visible in feed, make them count
- Line breaks for emphasis and scannability

**Twitter/X**:
- Single paragraph, ultra-concise
- Use line breaks only if doing a thread
- Thread format: Number tweets (1/5, 2/5, etc.)

**POSTING TIME OPTIMIZATION**:

**By Platform**:
- **Facebook**: Wed-Fri 9am-3pm (peak engagement)
- **Instagram**: Mon-Fri 11am-2pm, Wed 11am-1pm best
- **LinkedIn**: Tue-Thu 7am-9am, 12pm-2pm (B2B working hours)
- **Twitter**: Mon-Fri 9am-3pm, Wed 9am best

**By Industry Modifiers**:
- **B2B**: Early morning (7-9am) or lunch (12-1pm) on weekdays
- **B2C Retail**: Evenings (7-9pm) and weekends
- **Restaurants**: Thu-Sun 11am-1pm (lunch planning), 5-7pm (dinner planning)
- **Services**: Tue-Thu morning/lunch (decision-making times)
- **Entertainment**: Thu-Sat evenings (weekend planning)

**ENGAGEMENT TACTICS** (3 specific tips per post):

**Tactical Categories**:
1. **Timing**: When to post, when to respond, when to boost
2. **Interaction**: How to encourage comments, shares, saves
3. **Amplification**: Cross-promotion, tagging, paid boost strategies
4. **Community**: Building relationships, responding to comments
5. **Content**: Hooks, formats, media types that perform well

**OUTPUT FORMAT**: Return JSON only:
{
  "hashtags": ["DenverBBQ", "CateringDenver", "GameDayFood"],
  "formatting": {
    "lineBreaks": 3,
    "paragraphCount": 2,
    "useEmphasis": false
  },
  "bestTimeToPost": "Thursday 11am-1pm (before weekend planning)",
  "engagementTips": [
    "Tag local sports groups to expand reach",
    "Respond to all comments within 1 hour to boost algorithm",
    "Pin post during game week for maximum visibility"
  ]
}

**EXAMPLE - Restaurant Facebook Post**:
{
  "hashtags": ["DenverBBQ", "CateringDenver", "GameDayFood"],
  "formatting": {
    "lineBreaks": 4,
    "paragraphCount": 3,
    "useEmphasis": false
  },
  "bestTimeToPost": "Thursday 11am-1pm (before weekend planning)",
  "engagementTips": [
    "Tag local sports groups and team fan pages to expand reach",
    "Respond to all comments within 1 hour to boost algorithm ranking",
    "Pin post Thursday-Sunday during game week for maximum visibility"
  ]
}

**EXAMPLE - SaaS LinkedIn Post**:
{
  "hashtags": ["ProductivityTools", "AIAutomation", "SaaS", "WorkflowOptimization", "TechLeadership"],
  "formatting": {
    "lineBreaks": 5,
    "paragraphCount": 4,
    "useEmphasis": true
  },
  "bestTimeToPost": "Tuesday 8-9am (B2B decision-makers starting workday)",
  "engagementTips": [
    "Share in relevant LinkedIn Groups focused on productivity and automation",
    "Engage with comments from CTOs and operations leaders in your network",
    "Consider boosting to reach VP+ titles at companies with 50-500 employees"
  ]
}

Remember: Hashtags should be discoverable, relevant, and appropriate for the platform and business type.`;

export async function generateSocialStyle(
  params: StyleGenerationParams
): Promise<StyleResult> {
  const { platform, businessContext, copy, platformSpec } = params;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: STYLE_AGENT_PROMPT },
      {
        role: "user",
        content: `Generate hashtags, formatting, and engagement strategy for ${platform}.

**BUSINESS CONTEXT**:
${businessContext}

**POST COPY**:
${copy}

**PLATFORM SPECS**:
- Hashtag limit: ${platformSpec.hashtagLimit}
- Tone: ${platformSpec.tone}

Provide strategic hashtags (quality over quantity), optimal formatting advice, best posting time, and 3 specific engagement tactics.

Return ONLY valid JSON.`,
      },
    ],
    temperature: 0.7, // Moderate creativity for strategic selection
    max_tokens: 600,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate style");
  }

  try {
    return JSON.parse(content) as StyleResult;
  } catch (error) {
    console.error("Failed to parse style agent response:", error);
    throw new Error("Invalid style generation response");
  }
}
