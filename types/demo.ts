export interface DemoFAQItem {
  question: string;
  answer: string;
}

export interface DemoChatbotConfig {
  persona: string;
  faq: DemoFAQItem[];
}

export interface DemoInsights {
  profitIq: string;
  actions: string[];
}

export interface DemoSocialPost {
  platform: string;
  copy: string;
  cta: string;
}

export interface DemoHomepageSection {
  title: string;
  body: string;
  ctaLabel?: string;
}

export interface DemoHomepageMock {
  hero: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    backgroundIdea: string;
  };
  sections: DemoHomepageSection[];
  style: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    tone: string;
  };
}

export interface DemoBlogPost {
  title: string;
  excerpt: string;
  outline: string[];
  body: string;
  suggestedTags: string[];
}

export interface ContentCalendarItem {
  day: string;
  date: string;
  time: string;
  content: string;
  platform: string;
  hashtags: string[];
  postType: string;
  engagement: string;
}

export interface GeneratedDemo {
  id: string;
  clientId: string;
  url?: string;
  summary: string;
  keyItems: string[];
  chatbotConfig: DemoChatbotConfig;
  insights: DemoInsights;
  socialPosts: DemoSocialPost[];
  homepage: DemoHomepageMock;
  blogPost: DemoBlogPost;
  createdAt: string;
}

export type DemoCacheRecord = GeneratedDemo;
