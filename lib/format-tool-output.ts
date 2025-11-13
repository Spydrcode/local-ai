/**
 * Format Tool Output for Client Copy/Paste
 *
 * Converts JSON tool outputs into clean, readable formats that clients can copy and paste directly
 */

export function formatToolOutput(toolId: string, data: any): string {
  // Handle different tool types with specific formatters

  // Social Media Posts (Facebook, Instagram) - needs emojis
  if (
    toolId.includes("facebook") ||
    toolId.includes("instagram") ||
    toolId.includes("social")
  ) {
    return formatSocialPost(data);
  }

  // Ad Copy
  if (toolId.includes("ad-copy")) {
    return formatAdCopy(data);
  }

  // Email/Newsletter
  if (
    toolId.includes("email") ||
    toolId.includes("newsletter") ||
    toolId.includes("win-back")
  ) {
    return formatEmail(data);
  }

  // Why Choose Us / Landing Pages / Long-form content
  if (
    toolId.includes("why-choose") ||
    toolId.includes("landing-page") ||
    toolId.includes("positioning")
  ) {
    return formatLongFormContent(data);
  }

  // Blog Posts
  if (toolId.includes("blog")) {
    return formatBlogPost(data);
  }

  // Video Scripts
  if (toolId.includes("video")) {
    return formatVideoScript(data);
  }

  // Review Responses
  if (toolId.includes("review")) {
    return formatReviewResponse(data);
  }

  // SEO Meta Tags
  if (toolId.includes("seo-meta")) {
    return formatSEOMeta(data);
  }

  // FAQ
  if (toolId.includes("faq")) {
    return formatFAQ(data);
  }

  // Default: Professional format
  return formatProfessional(data);
}

function formatSocialPost(data: any): string {
  let output = "";

  if (data.post || data.body || data.text) {
    output += (data.post || data.body || data.text) + "\n\n";
  }

  if (data.hashtags) {
    output += Array.isArray(data.hashtags)
      ? data.hashtags.join(" ")
      : data.hashtags;
    output += "\n\n";
  }

  if (data.caption_options && Array.isArray(data.caption_options)) {
    output += "📝 ALTERNATIVE CAPTIONS:\n\n";
    data.caption_options.forEach((cap: string, i: number) => {
      output += `Option ${i + 1}:\n${cap}\n\n`;
    });
  }

  if (data.best_time_to_post) {
    output += `⏰ Best time to post: ${data.best_time_to_post}\n`;
  }

  return output.trim();
}

function formatAdCopy(data: any): string {
  let output = "📢 AD COPY\n\n";

  if (data.headline) {
    output += `HEADLINE:\n${data.headline}\n\n`;
  }

  if (data.body || data.text) {
    output += `BODY:\n${data.body || data.text}\n\n`;
  }

  if (data.cta) {
    output += `CALL-TO-ACTION:\n${data.cta}\n\n`;
  }

  if (data.targeting_tips) {
    output += `🎯 TARGETING TIPS:\n${data.targeting_tips}\n`;
  }

  return output.trim();
}

function formatEmail(data: any): string {
  let output = "";

  if (data.subject || data.subject_line) {
    output += `SUBJECT: ${data.subject || data.subject_line}\n\n`;
  }

  if (data.preview_text) {
    output += `PREVIEW: ${data.preview_text}\n\n`;
  }

  output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

  if (data.body || data.content || data.email_body) {
    output += (data.body || data.content || data.email_body) + "\n\n";
  }

  if (data.ps) {
    output += `P.S. ${data.ps}\n`;
  }

  return output.trim();
}

function formatLongFormContent(data: any): string {
  let output = "";

  // Headline
  if (data.headline || data.title) {
    output += `${data.headline || data.title}\n`;
    output += "=".repeat((data.headline || data.title).length) + "\n\n";
  }

  // Subheadline
  if (data.subheadline || data.subtitle) {
    output += `${data.subheadline || data.subtitle}\n\n`;
  }

  // Main sections
  if (
    data.differentiator_sections &&
    Array.isArray(data.differentiator_sections)
  ) {
    data.differentiator_sections.forEach((section: any) => {
      output += `${section.title}\n`;
      output += "-".repeat(section.title.length) + "\n";
      if (section.description) output += `${section.description}\n\n`;
      if (section.benefit) output += `✓ ${section.benefit}\n\n`;
    });
  }

  // Comparison section
  if (data.comparison_section) {
    output += `How We're Different\n`;
    output += "-".repeat("How We're Different".length) + "\n";
    output += `${data.comparison_section}\n\n`;
  }

  // Promise
  if (data.promise_statement || data.promise) {
    output += `Our Promise\n`;
    output += "-".repeat("Our Promise".length) + "\n";
    output += `${data.promise_statement || data.promise}\n\n`;
  }

  // CTA
  if (data.cta) {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `👉 ${data.cta}\n\n`;
  }

  // SEO Keywords (optional, at the bottom)
  if (data.seo_keywords && Array.isArray(data.seo_keywords)) {
    output += `\nSEO Keywords: ${data.seo_keywords.join(", ")}\n`;
  }

  return output.trim();
}

function formatBlogPost(data: any): string {
  let output = "";

  if (data.title) {
    output += `${data.title}\n`;
    output += "=".repeat(data.title.length) + "\n\n";
  }

  if (data.meta_description) {
    output += `Meta Description: ${data.meta_description}\n\n`;
  }

  if (data.introduction || data.intro) {
    output += `${data.introduction || data.intro}\n\n`;
  }

  if (data.sections && Array.isArray(data.sections)) {
    data.sections.forEach((section: any, i: number) => {
      if (section.heading) {
        output += `${section.heading}\n`;
        output += "-".repeat(section.heading.length) + "\n";
      }
      if (section.content) {
        output += `${section.content}\n\n`;
      }
    });
  } else if (data.body || data.content) {
    output += `${data.body || data.content}\n\n`;
  }

  if (data.conclusion) {
    output += `Conclusion\n`;
    output += "-".repeat("Conclusion".length) + "\n";
    output += `${data.conclusion}\n\n`;
  }

  if (data.cta) {
    output += `${data.cta}\n\n`;
  }

  if (data.keywords && Array.isArray(data.keywords)) {
    output += `\nKeywords: ${data.keywords.join(", ")}\n`;
  }

  return output.trim();
}

function formatVideoScript(data: any): string {
  let output = "🎬 VIDEO SCRIPT\n\n";

  if (data.hook) {
    output += `HOOK (First 3 seconds):\n${data.hook}\n\n`;
  }

  if (data.intro || data.introduction) {
    output += `INTRODUCTION:\n${data.intro || data.introduction}\n\n`;
  }

  if (data.main_content || data.body) {
    output += `MAIN CONTENT:\n${data.main_content || data.body}\n\n`;
  }

  if (data.cta) {
    output += `CALL-TO-ACTION:\n${data.cta}\n\n`;
  }

  if (data.visual_suggestions) {
    output += `📹 VISUAL SUGGESTIONS:\n${data.visual_suggestions}\n`;
  }

  return output.trim();
}

function formatReviewResponse(data: any): string {
  let output = "";

  if (data.response || data.reply) {
    output += (data.response || data.reply) + "\n\n";
  }

  if (data.tone) {
    output += `Tone: ${data.tone}\n`;
  }

  if (data.tips && Array.isArray(data.tips)) {
    output += `\nResponse Tips:\n`;
    data.tips.forEach((tip: string) => {
      output += `• ${tip}\n`;
    });
  }

  return output.trim();
}

function formatSEOMeta(data: any): string {
  let output = "SEO META TAGS\n\n";

  if (data.title || data.meta_title) {
    output += `Title Tag:\n${data.title || data.meta_title}\n\n`;
  }

  if (data.description || data.meta_description) {
    output += `Meta Description:\n${data.description || data.meta_description}\n\n`;
  }

  if (data.keywords && Array.isArray(data.keywords)) {
    output += `Keywords:\n${data.keywords.join(", ")}\n\n`;
  }

  if (data.h1) {
    output += `H1 Heading:\n${data.h1}\n\n`;
  }

  if (data.url_slug) {
    output += `URL Slug:\n${data.url_slug}\n`;
  }

  return output.trim();
}

function formatFAQ(data: any): string {
  let output = "FREQUENTLY ASKED QUESTIONS\n\n";

  if (data.faqs && Array.isArray(data.faqs)) {
    data.faqs.forEach((faq: any, i: number) => {
      output += `Q${i + 1}: ${faq.question}\n`;
      output += `A: ${faq.answer}\n\n`;
    });
  } else if (data.questions && Array.isArray(data.questions)) {
    data.questions.forEach((item: any, i: number) => {
      output += `Q${i + 1}: ${item.question || item.q}\n`;
      output += `A: ${item.answer || item.a}\n\n`;
    });
  }

  return output.trim();
}

function formatProfessional(data: any): string {
  // Generic professional formatter for any tool
  let output = "";

  // Handle common top-level fields
  const topFields = ["title", "headline", "name", "subject"];
  topFields.forEach((field) => {
    if (data[field]) {
      output += `${data[field]}\n`;
      output += "=".repeat(String(data[field]).length) + "\n\n";
    }
  });

  // Handle subtitle/description
  const subFields = ["subtitle", "subheadline", "description", "summary"];
  subFields.forEach((field) => {
    if (data[field]) {
      output += `${data[field]}\n\n`;
    }
  });

  // Handle main content
  const contentFields = ["content", "body", "text", "copy"];
  contentFields.forEach((field) => {
    if (data[field]) {
      output += `${data[field]}\n\n`;
    }
  });

  // Handle lists/arrays
  Object.keys(data).forEach((key) => {
    if (
      Array.isArray(data[key]) &&
      !["keywords", "seo_keywords", "tags"].includes(key)
    ) {
      output += `${key.replace(/_/g, " ").toUpperCase()}:\n`;
      data[key].forEach((item: any, i: number) => {
        if (typeof item === "string") {
          output += `${i + 1}. ${item}\n`;
        } else if (typeof item === "object") {
          output += `\n${i + 1}. ${item.title || item.name || ""}\n`;
          if (item.description || item.content) {
            output += `   ${item.description || item.content}\n`;
          }
        }
      });
      output += "\n";
    }
  });

  // Handle CTA
  if (data.cta || data.call_to_action) {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `👉 ${data.cta || data.call_to_action}\n\n`;
  }

  // Handle keywords at the end
  const keywordFields = ["keywords", "seo_keywords", "tags"];
  keywordFields.forEach((field) => {
    if (data[field] && Array.isArray(data[field])) {
      output += `\n${field.replace(/_/g, " ").toUpperCase()}: ${data[field].join(", ")}\n`;
    }
  });

  return output.trim();
}
