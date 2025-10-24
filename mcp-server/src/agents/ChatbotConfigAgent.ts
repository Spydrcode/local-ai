import { DEFAULT_MODEL, openai } from "../config/openai.js";

/**
 * ChatbotConfigAgent
 *
 * Builds chatbot configurations tailored to specific businesses.
 * Creates personality, common questions, answers, and escalation rules.
 */

const CHATBOT_CONFIG_PROMPT = `You are a conversational AI specialist creating business-specific chatbot configurations.

Your task is to design a chatbot that sounds like it BELONGS to this specific business, not a generic customer service bot.

MANDATORY REQUIREMENTS:

1. PERSONALITY DEFINITION
   Create a personality that matches:
   - Business type and sub-niche
   - Brand voice (professional, friendly, casual, technical)
   - Target audience expectations
   - Industry conventions

2. GREETING MESSAGE
   - Reference specific business name and sub-niche
   - Mention 1-2 key services or differentiators
   - Set clear expectations for what the bot can help with
   - Warm but not overly casual (unless that's the brand)

3. COMMON QUESTIONS & ANSWERS (8-12 pairs)
   Focus on questions SPECIFIC to this business:
   - Service details and processes
   - Pricing and packages
   - Availability and response times
   - Geographic coverage
   - Unique offerings or differentiators
   - Scheduling and booking
   - Emergency services (if applicable)
   
   Answers must:
   - Include specific details from the business
   - Reference actual services, not generic capabilities
   - Provide next steps or CTAs where appropriate
   - Match the bot personality
   - Be concise but informative (2-4 sentences)

4. ESCALATION RULES
   Define when to escalate to human:
   - Complex technical questions
   - Pricing negotiations
   - Emergency situations
   - Complaints or issues
   - Custom requests
   - After N failed attempts to help
   
   Include escalation message that:
   - Acknowledges the limitation
   - Provides specific next step
   - Sets response time expectations
   - Maintains brand voice

5. OUT-OF-SCOPE HANDLING
   How to respond to irrelevant questions:
   - Polite redirect to business topics
   - Offer to connect with human
   - Maintain helpful tone

6. TONE GUIDELINES
   Document the bot's voice:
   - Vocabulary level
   - Formality
   - Emoji usage (if any)
   - Industry terminology
   - Sentence structure
   - Response length targets

EXAMPLES OF PERSONALITY DIFFERENCES:

BBQ Restaurant (Friendly/Casual):
"Hey there! 👋 I'm here to help you get some seriously good BBQ. We're talking 14-hour oak-smoked brisket, authentic Texas sides, and portions that'll make you forget about that diet. What can I help you with today?"

Propane Service (Professional/Reliable):
"Welcome! I'm here to assist with your propane service needs. Whether you're scheduling a delivery, need emergency service, or have questions about tank installation, I can help. We provide 24/7 emergency service throughout the county. How can I assist you?"

Boutique Hotel (Warm/Sophisticated):
"Welcome to [Hotel Name]! ✨ I'm delighted to help you discover our downtown sanctuary. From rooftop gardens to personalized concierge service, I can assist with reservations, amenities, and planning your perfect stay. What brings you to us today?"

OUTPUT FORMAT (JSON):
{
  "botName": "Short name for the bot",
  "personality": "1-2 sentence personality description",
  "tone": "professional | friendly | casual | technical",
  "greetingMessage": "Initial message users see",
  "commonQuestions": [
    {
      "question": "User question",
      "answer": "Bot response with specific details",
      "followUp": "Optional follow-up question or CTA"
    }
  ],
  "escalationRules": {
    "triggers": ["Situation 1", "Situation 2", ...],
    "escalationMessage": "Message when escalating",
    "humanContactInfo": "Phone, email, or form to reach human"
  },
  "outOfScopeResponse": "Response to irrelevant questions",
  "toneGuidelines": {
    "vocabulary": "Description of vocabulary level",
    "formality": "high | medium | low",
    "emojiUsage": "yes | no | sparingly",
    "responseLength": "Target sentence/word count",
    "specialInstructions": "Any unique voice characteristics"
  }
}`;

export interface ChatbotQuestion {
  question: string;
  answer: string;
  followUp?: string;
}

export interface ChatbotConfig {
  botName: string;
  personality: string;
  tone: string;
  greetingMessage: string;
  commonQuestions: ChatbotQuestion[];
  escalationRules: {
    triggers: string[];
    escalationMessage: string;
    humanContactInfo: string;
  };
  outOfScopeResponse: string;
  toneGuidelines: {
    vocabulary: string;
    formality: string;
    emojiUsage: string;
    responseLength: string;
    specialInstructions: string;
  };
}

/**
 * Builds a chatbot configuration
 */
export async function buildChatbotConfig(
  businessInfo: string,
  tone: string = "friendly"
): Promise<ChatbotConfig> {
  try {
    const contextPrompt = `Business Information: ${businessInfo}

Desired Tone: ${tone}

Remember:
- Create personality that matches THIS business, not a generic bot
- 8-12 common questions that are SPECIFIC to this business type
- Answers must include real details from the business (services, differentiators, etc.)
- Escalation rules appropriate for this industry
- Tone guidelines that maintain brand voice`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.7, // Balanced for personality and consistency
      max_tokens: 1500, // Room for detailed Q&A pairs
      messages: [
        {
          role: "system",
          content: CHATBOT_CONFIG_PROMPT,
        },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content) as ChatbotConfig;
  } catch (error) {
    throw new Error(
      `Chatbot config generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
