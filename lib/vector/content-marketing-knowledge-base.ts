/**
 * Content Marketing Agents Knowledge Base
 * RAG-optimized knowledge for 7 content marketing agents:
 * - FacebookMarketingAgent
 * - InstagramMarketingAgent
 * - LinkedInMarketingAgent
 * - BlogWriterAgent
 * - VideoScriptAgent
 * - NewsletterAgent
 * - FAQAgent
 */

export interface ContentMarketingKnowledge {
  id: string;
  content: string;
  metadata: {
    agentType:
      | "facebook-marketing"
      | "instagram-marketing"
      | "linkedin-marketing"
      | "blog-writer"
      | "video-script"
      | "newsletter"
      | "faq-builder";
    category:
      | "best-practices"
      | "examples"
      | "formulas"
      | "psychology"
      | "platform-specific"
      | "seo";
    topic: string[];
    industry?: string;
    businessSize?: "startup" | "small" | "medium" | "enterprise";
    confidence: number;
    lastUpdated: string;
  };
}

export const CONTENT_MARKETING_KNOWLEDGE_BASE: ContentMarketingKnowledge[] = [
  // ============================================================================
  // FACEBOOK MARKETING AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "facebook-001",
    content:
      "Facebook algorithm prioritizes posts that generate meaningful interactions (comments, shares, saves) over likes. To maximize reach: Start with a question or bold statement in the first sentence, use 2-3 emojis naturally throughout, write in short paragraphs (1-2 sentences each), end with a clear question or call-to-action. Optimal post length: 100-150 words. Best posting times: Tuesday-Thursday 1-3pm local time.",
    metadata: {
      agentType: "facebook-marketing",
      category: "platform-specific",
      topic: ["algorithm", "engagement", "timing", "reach"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "facebook-002",
    content:
      "Facebook engagement triggers: Use pattern interrupts (surprising facts, questions, 'Did you know...'), tap emotions (joy, surprise, curiosity, not anger/sadness), create micro-commitments (easy asks like 'Double tap if you agree'), leverage social proof ('Join 5,000+ happy customers'), add urgency (limited time, limited spots). Avoid: Hard selling, external links (kills reach), controversial topics that start arguments.",
    metadata: {
      agentType: "facebook-marketing",
      category: "psychology",
      topic: ["engagement", "copywriting", "conversion"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "facebook-003",
    content:
      "Facebook post structure formula: Hook (first 7 words critical - stops scroll), Context (quick setup - 1-2 sentences), Value (main point, benefit, or story - 2-3 sentences), Social Proof (if applicable - quick mention), CTA (clear next step - question or instruction). Example: '[Hook] This one trick saved us 10 hours/week. [Context] We were drowning in admin work. [Value] Then we discovered automation... [Social] Hundreds of clients now use this. [CTA] Want the free template?'",
    metadata: {
      agentType: "facebook-marketing",
      category: "formulas",
      topic: ["structure", "copywriting", "conversion"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "facebook-004",
    content:
      "Facebook emoji strategy: Use 3-5 emojis per post strategically. Place one in the hook for visual interest, one mid-post to break up text, one before CTA for emphasis. Choose emojis that match your brand voice: Professional (📊 💼 ✅ 📈), Fun (🎉 ✨ 💪 🔥), Friendly (😊 ❤️ 👋 🙌). Avoid: Overuse (looks spammy), irrelevant emojis (confusing), inconsistent style (unprofessional).",
    metadata: {
      agentType: "facebook-marketing",
      category: "best-practices",
      topic: ["emojis", "visual-content", "brand-voice"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // INSTAGRAM MARKETING AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "instagram-001",
    content:
      "Instagram caption psychology: First 125 characters are critical (before 'more' cut-off). Use this space for the hook or complete thought. Instagram users scroll fast - visual storytelling beats long captions. Optimal formats: Micro (under 50 words) for quick tips, Short (50-100) for announcements, Medium (100-200) for stories, Long (200+) for deep value. Use line breaks (tap 'return' twice) every 2-3 lines for readability on mobile.",
    metadata: {
      agentType: "instagram-marketing",
      category: "platform-specific",
      topic: ["captions", "readability", "mobile-optimization"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "instagram-002",
    content:
      "Instagram hashtag strategy 2025: Use 10-15 hashtags (not 30 - looks spammy). Mix: 3-4 broad reach (100k-1M posts), 4-5 medium (10k-100k), 3-4 niche (1k-10k), 1-2 branded (your own). Place in first comment or caption end to keep clean. Research competitors' top-performing hashtags. Rotate hashtag sets (5-7 variations) to avoid shadowban. Local businesses: Always use location-based hashtags (#YourCity, #YourCityBusiness).",
    metadata: {
      agentType: "instagram-marketing",
      category: "best-practices",
      topic: ["hashtags", "reach", "discovery", "seo"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "instagram-003",
    content:
      "Instagram visual content guidance: Vertical video (9:16 Reels) gets 2x more reach than static posts. Color psychology: Bright colors (orange, red, yellow) grab attention, pastels create calm, dark colors convey luxury. Text on image: Use large, bold fonts (minimum 48pt), keep to 5-7 words max, place in top or bottom third (avoid center - covered by UI). User-generated content (customer photos) gets 4x more engagement than brand content.",
    metadata: {
      agentType: "instagram-marketing",
      category: "best-practices",
      topic: ["visual-content", "reels", "design", "ugc"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "instagram-004",
    content:
      "Instagram emoji density: Use 5-10 emojis per caption for optimal engagement. Higher emoji use correlates with higher engagement on Instagram (unlike other platforms). Place emojis: At line breaks (visual dividers), before key phrases (emphasis), in lists (bullet points). Popular high-engagement emojis: ✨ (magic/premium), 🔥 (trending/hot), 💯 (authentic/real), 👇 (direct attention), 💪 (empowerment). Match emojis to your niche - food businesses use 🍕🍰, fitness uses 💪🔥, beauty uses ✨💄.",
    metadata: {
      agentType: "instagram-marketing",
      category: "best-practices",
      topic: ["emojis", "engagement", "visual-storytelling"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // LINKEDIN MARKETING AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "linkedin-001",
    content:
      "LinkedIn algorithm 2025: Prioritizes posts that spark professional conversations. Keys to reach: Write 150-200 words (sweet spot for engagement), use 2-4 line breaks (scannable), ask thoughtful questions, share personal insights (not just facts), use 2-4 professional emojis (builds personality), comment on your own post within 1 hour (boosts algorithm). Avoid: External links in main post (kills reach), hashtags spam (3-5 max), overly promotional content.",
    metadata: {
      agentType: "linkedin-marketing",
      category: "platform-specific",
      topic: ["algorithm", "reach", "engagement", "professional"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "linkedin-002",
    content:
      "LinkedIn content types that perform: Thought leadership (share contrarian opinions with rationale), Personal stories (challenges overcome, lessons learned), Industry insights (trends, predictions, data), How-to content (tactical tips), Celebration posts (team wins, milestones). Format: Start with the conclusion, explain the journey, provide actionable takeaway. Use first-person narrative - LinkedIn is about personal brand. Example structure: Bold statement → Personal experience → Industry insight → Actionable advice → Question.",
    metadata: {
      agentType: "linkedin-marketing",
      category: "formulas",
      topic: ["content-types", "thought-leadership", "storytelling"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "linkedin-003",
    content:
      "LinkedIn tone calibration: Professional but human. Use 'I' and 'we' (personal), not 'one should' (corporate). Share vulnerability (learning moments, mistakes), not perfection (filtered success). Include specific numbers and results (builds credibility), not vague claims ('many clients' vs '47 clients'). Add humor where appropriate, but keep it professional (no memes, keep emojis minimal). Goal: Sound like the colleague everyone wants to learn from, not the salesperson everyone avoids.",
    metadata: {
      agentType: "linkedin-marketing",
      category: "best-practices",
      topic: ["tone", "authenticity", "credibility", "personal-brand"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "linkedin-004",
    content:
      "LinkedIn engagement tactics: Post Tuesday-Thursday 7-9am or 12-1pm (B2B work hours), respond to comments within first 60 minutes (boosts reach), tag relevant people (sparingly - 1-2 max, only if genuinely relevant), use polls for easy engagement, create carousel posts (PDFs) for high saves (algorithm loves saves), share documents for extended reach. End every post with an engaging question - not 'What do you think?' but specific, thought-provoking questions that require expertise to answer.",
    metadata: {
      agentType: "linkedin-marketing",
      category: "best-practices",
      topic: ["engagement", "timing", "tactics", "reach"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // BLOG WRITER AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "blog-001",
    content:
      "SEO blog structure for ranking: Title tag (50-60 chars, primary keyword near start), H1 (can differ from title, include keyword naturally), Introduction (hook + promise of value, 50-100 words), H2 sections (3-4 sections, each with keyword variations), H3 subsections (break up long sections), Conclusion (summarize key points + CTA), optimal length 500-700 words for focused topics, 1500-2500 for comprehensive guides. Use keyword in first 100 words, sprinkle variations throughout, end with keyword in conclusion.",
    metadata: {
      agentType: "blog-writer",
      category: "seo",
      topic: ["structure", "keywords", "on-page-seo", "rankings"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "blog-002",
    content:
      "Blog hooks that capture attention: Surprising statistic ('73% of businesses fail at X'), Bold contrarian statement ('Everyone is wrong about Y'), Personal story opening ('I lost $10k before learning...'), Question that creates curiosity ('What if everything you know about Z is backwards?'), Pattern interrupt ('Stop doing X. Here's why...'). Follow hook with a promise: Tell them exactly what they'll learn. Example: '[Hook] Then explain: In this guide, you'll discover the 5-step process we use to [specific benefit].'",
    metadata: {
      agentType: "blog-writer",
      category: "formulas",
      topic: ["hooks", "introductions", "copywriting", "engagement"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "blog-003",
    content:
      "Blog scanability for mobile readers: Use short paragraphs (2-4 sentences max), bullet points for lists (easier to scan than paragraphs), bolded key phrases (guide eyes to important points), subheadings every 200-300 words (create natural breaks), white space generously (improves readability), pull quotes for key insights (visual interest), numbered lists when order matters, images every 300-400 words (break up text walls). Mobile readers skim first - make it easy to find value quickly.",
    metadata: {
      agentType: "blog-writer",
      category: "best-practices",
      topic: ["readability", "ux", "mobile", "formatting"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "blog-004",
    content:
      "Blog authority building techniques: Use data and statistics (cite sources), include expert quotes or interviews, share case studies with results ('Client X increased Y by Z%'), reference industry reports, link to authoritative sources (builds trust), use schema markup (AuthorRank, Article schema), show methodology ('Here's how we tested this...'), add author bio with credentials, update content regularly (Google rewards freshness). E-E-A-T (Experience, Expertise, Authoritativeness, Trust) is Google's quality guideline.",
    metadata: {
      agentType: "blog-writer",
      category: "seo",
      topic: ["authority", "trust", "credibility", "e-e-a-t"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // VIDEO SCRIPT AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "video-001",
    content:
      "Video hook psychology (first 3 seconds): Use pattern interrupts that make viewers stop scrolling. Effective hooks: Unexpected visual (someone doing something unusual), Provocative statement ('I spent $50k learning this...'), Immediate value ('Here's how to X in 30 seconds'), Questions that create curiosity ('Can you guess what happens next?'), Text overlay that contradicts video ('This is a bad idea...' showing good result). Avoid slow intros - cut straight to the point. First 3 seconds determine if they watch next 30 seconds.",
    metadata: {
      agentType: "video-script",
      category: "psychology",
      topic: ["hooks", "retention", "attention", "scroll-stopping"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "video-002",
    content:
      "Video pacing and timing: 30-second format = 1 point, 60-second = 2-3 points, 90-second = 3-4 points, 2-3 minute = story arc with 5+ points. Use pacing markers: [PAUSE] for emphasis, [QUICK] for energy, [SLOW DOWN] for important info, [ENTHUSIASM] for excitement, [SERIOUS] for gravity. Visual direction every 5-10 seconds: [VISUAL: Close-up of product], [VISUAL: Cut to B-roll], [VISUAL: On-screen text]. Scene length: 3-7 seconds per scene for social media (faster = higher retention), 10-15 seconds for YouTube (slower = more depth).",
    metadata: {
      agentType: "video-script",
      category: "best-practices",
      topic: ["pacing", "timing", "structure", "retention"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "video-003",
    content:
      "Video script formula for conversion: Hook (3 sec), Problem (5-10 sec - establish pain), Agitate (5-10 sec - why problem is urgent), Solution (15-20 sec - introduce your offer), Proof (10-15 sec - testimonial, results, demo), CTA (5 sec - clear next step). Total: 45-60 seconds. Example: [Hook] Struggling with X? [Problem] Most people waste hours on Y. [Agitate] That's costing you $Z per month. [Solution] We built a tool that does Y in 60 seconds. [Proof] See how it works... [CTA] Link in bio for free trial.",
    metadata: {
      agentType: "video-script",
      category: "formulas",
      topic: ["conversion", "structure", "persuasion", "sales"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "video-004",
    content:
      "Video B-roll and visual suggestions: Product videos need 3 shot types: Wide (context), Medium (interaction), Close-up (details). Service videos need: Person talking (build trust), Examples/demos (show value), Customer testimonials (social proof), Results/data (credibility). Transitions: Cut on movement (feels natural), Match cuts (same subject different angle), Text overlays (emphasize key points). B-roll suggestions: Show the problem being solved, hands interacting with product, before/after comparisons, happy customers using product, team working (builds trust).",
    metadata: {
      agentType: "video-script",
      category: "best-practices",
      topic: ["visuals", "production", "b-roll", "cinematography"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // NEWSLETTER AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "newsletter-001",
    content:
      "Email subject line formulas that boost opens: Curiosity gap ('The one thing I wish I knew about X'), Urgency ('Last chance: X ends tonight'), Personalization ('[Name], this is important'), Numbers ('5 ways to improve X by 50%'), Question ('Are you making this X mistake?'), Benefit-driven ('How to achieve X without Y'), Negative angle ('Stop wasting money on X'). Optimal length: 30-50 characters (mobile preview). A/B test constantly - what works varies by audience. Avoid spam triggers: ALL CAPS, !!!, $$$, 'Free!!!', 'Act now'.",
    metadata: {
      agentType: "newsletter",
      category: "formulas",
      topic: ["subject-lines", "open-rates", "email-deliverability"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "newsletter-002",
    content:
      "Newsletter structure for engagement: Subject line (hook), Preview text (extend intrigue, don't repeat subject), Personal greeting (use first name), Opening sentence (address pain/desire), Value-first section (tip, insight, story - 80% of content), Promotional section (soft pitch - 20% of content), Primary CTA (clear button/link), PS (secondary offer or personal note). Optimal length: 300-500 words (5-minute read). Use single-column design (mobile-friendly), images sparingly (email clients block images), plaintext style beats fancy HTML (feels personal).",
    metadata: {
      agentType: "newsletter",
      category: "best-practices",
      topic: ["structure", "engagement", "conversion", "design"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "newsletter-003",
    content:
      "Newsletter segmentation strategies: Engagement-based (active, lapsing, cold), Behavior-based (clicked X, purchased Y, downloaded Z), Demographic (industry, role, company size), Lifecycle stage (new subscriber, customer, power user). Send different content to each segment. Example: New subscribers get educational content + product intro, Active users get advanced tips + case studies, Lapsing users get re-engagement offers + 'we miss you' messages. Segmented emails get 3x higher open rates and 5x higher click rates than broadcast emails.",
    metadata: {
      agentType: "newsletter",
      category: "best-practices",
      topic: ["segmentation", "personalization", "automation", "targeting"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "newsletter-004",
    content:
      "Newsletter send time optimization: B2B: Tuesday-Thursday 10am-12pm or 2-3pm (avoid Monday morning, Friday afternoon), B2C: Weekend mornings for leisure reading, evening after work for shopping emails. Test your audience - send time optimization tools (in Mailchimp, ConvertKit) auto-optimize per subscriber. Consistency beats perfect timing - train audience to expect your email. Example: 'Every Tuesday at 10am' builds habit. Frequency: Weekly is optimal for most businesses (stay top-of-mind without annoying), daily only if you're a news source, monthly only for very high-value content.",
    metadata: {
      agentType: "newsletter",
      category: "best-practices",
      topic: ["timing", "frequency", "optimization", "deliverability"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // FAQ AGENT KNOWLEDGE
  // ============================================================================
  {
    id: "faq-001",
    content:
      "FAQ SEO optimization: Google features snippets from FAQ pages. Structure for featured snippets: Question as H2 or H3 heading, Answer in first paragraph (40-60 words), More detail in subsequent paragraphs if needed. Use schema markup (FAQPage schema) for rich results in search. Question format: Use natural language people search ('How much does X cost?' not 'Pricing'), include location if local ('Do you serve [City]?'), use long-tail keywords ('How long does X take to install?' vs 'Installation time'). Each Q&A targets different search query - spread keywords across FAQs.",
    metadata: {
      agentType: "faq-builder",
      category: "seo",
      topic: ["featured-snippets", "schema-markup", "search-optimization"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "faq-002",
    content:
      "FAQ category structure for UX: Organize into 5-7 categories max. Standard categories: General (about business, what makes you different), Services/Products (what's included, how it works, limitations), Pricing (costs, payment options, value justification, hidden fees), Process (steps, timeline, what to expect, how to get started), Support (contact, guarantees, refund policy, ongoing support). Place highest-priority FAQs at top of each category. Use expandable accordions (saves space, reduces overwhelm), or separate pages per category for larger FAQ databases. Add search functionality if 20+ FAQs.",
    metadata: {
      agentType: "faq-builder",
      category: "best-practices",
      topic: ["ux", "navigation", "information-architecture", "categories"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "faq-003",
    content:
      "FAQ psychology - addressing objections: Common objection patterns: Price ('Is it worth it?'), Trust ('Can I trust you?'), Timing ('Is now the right time?'), Comparison ('Why you vs competitors?'), Risk ('What if it doesn't work?'). Answer objections directly and positively. Price objection example: 'How much does it cost?' Answer: 'Pricing starts at $X/month. Most clients see ROI within 60 days through [specific benefit], making the investment a no-brainer.' Not: 'Prices vary. Contact us.' Use social proof in answers: 'Over 500 businesses trust us because...'",
    metadata: {
      agentType: "faq-builder",
      category: "psychology",
      topic: ["objection-handling", "conversion", "trust-building"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "faq-004",
    content:
      "FAQ answer formatting: Keep answers scannable - use bullet points for multi-part answers, bold key phrases, short sentences (10-20 words). Answer length: Simple questions = 2-3 sentences (50-100 words), Complex questions = 100-150 words max (break into sub-questions if longer). Tone: Helpful and friendly, not robotic. Use 'we' and 'you' (personal), not 'the company' and 'customers' (corporate). Add CTAs where relevant: 'Want to learn more? Book a free consultation.' Link to related pages: 'See our guide to X for details.' Update FAQs based on support tickets - if customers keep asking it, add it to FAQs.",
    metadata: {
      agentType: "faq-builder",
      category: "best-practices",
      topic: ["formatting", "tone", "user-experience", "helpfulness"],
      confidence: 0.85,
      lastUpdated: "2025-01-13",
    },
  },

  // ============================================================================
  // CROSS-AGENT KNOWLEDGE (Applies to Multiple Agents)
  // ============================================================================
  {
    id: "cross-001",
    content:
      "Storytelling framework for all content types: Hero (your customer), Problem (their pain/challenge), Guide (your business), Plan (your solution/process), Action (clear CTA), Success (outcome they'll achieve), Failure avoidance (what happens if they don't act). This StoryBrand framework works for: Facebook posts (condense to 100 words), Instagram captions (visual storytelling), LinkedIn thought leadership, Blog posts (expand each element), Video scripts (visual storytelling), Newsletters (personal narrative), FAQs (answer 'why choose us').",
    metadata: {
      agentType: "blog-writer",
      category: "formulas",
      topic: ["storytelling", "structure", "conversion", "messaging"],
      confidence: 0.95,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "cross-002",
    content:
      "Brand voice consistency across channels: Define 3-5 voice attributes (examples: Professional yet approachable, Expert but humble, Friendly and energetic). Apply consistently: Facebook = casual version of voice, Instagram = visual expression of voice, LinkedIn = professional version of voice, Blog = authoritative version of voice, Email = personal version of voice. Maintain consistent: Tone (formal vs casual), Vocabulary (industry jargon vs plain language), Personality traits (humor, seriousness, enthusiasm), Value emphasis (what you always highlight). Voice guide: Choose 3 words that describe your brand voice, find opposite of each word (what you're NOT), give examples of good vs bad voice usage.",
    metadata: {
      agentType: "facebook-marketing",
      category: "best-practices",
      topic: ["brand-voice", "consistency", "messaging", "identity"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
  {
    id: "cross-003",
    content:
      "Call-to-action (CTA) best practices across all content: Clarity over cleverness - use direct action words (Get, Download, Start, Join, Learn, Book, Claim). CTA formula: [Action Verb] + [What They Get] + [Optional: Urgency/Benefit]. Examples: 'Download your free guide' (better than 'Get it now'), 'Book your free consultation' (better than 'Contact us'), 'Start your 14-day trial' (better than 'Sign up'). Platform-specific CTAs: Facebook = 'Comment below' or 'Share this', Instagram = 'Link in bio' or 'Save for later', LinkedIn = 'Connect with me' or 'What's your experience?', Blog = Button CTAs, Video = 'Click the link below', Newsletter = Primary button CTA, FAQ = 'Ready to get started?'",
    metadata: {
      agentType: "facebook-marketing",
      category: "formulas",
      topic: ["cta", "conversion", "action", "engagement"],
      confidence: 0.9,
      lastUpdated: "2025-01-13",
    },
  },
];
