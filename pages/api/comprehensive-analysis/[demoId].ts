import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  try {
    // Fetch demo data from Supabase
    let demoData = null;
    let businessName = "Sample Business";
    let websiteUrl = "https://example.com";

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("demos")
        .select("*")
        .eq("id", demoId)
        .single();

      if (!error && data) {
        demoData = data;
        websiteUrl = data.site_url || "https://example.com";

        // Extract business name from summary or URL
        if (data.summary) {
          // Try to extract business name from first sentence
          const summaryMatch = data.summary.match(
            /^([A-Z][^.!?]*(?:BBQ|Coffee|Propane|Bakery|Restaurant|Cafe|Shop|Store|Services|Company|Business|Corp|LLC|Inc)[^.!?]*)/i
          );
          if (summaryMatch) {
            businessName = summaryMatch[1].trim();
          }
        }

        // Fallback: extract from URL
        if (businessName === "Sample Business" && websiteUrl) {
          const urlMatch = websiteUrl.match(
            /(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/
          );
          if (urlMatch) {
            businessName = urlMatch[1]
              .split(/[-_]/)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        }
      }
    }

    const comprehensiveAnalysis = {
      demoId,
      businessName,
      websiteUrl,
      competitorAnalysis: {
        competitors: [
          {
            name: "Local Competitor A",
            url: "competitor-a.com",
            strengths: ["Strong online presence", "Good customer reviews"],
            weaknesses: [
              "Limited service offerings",
              "Outdated website design",
            ],
          },
          {
            name: "Local Competitor B",
            url: "competitor-b.com",
            strengths: ["Wide service area", "Competitive pricing"],
            weaknesses: ["Poor website UX", "No online booking"],
          },
        ],
        opportunities: [
          "Improve online booking system",
          "Enhance social media presence",
          "Add customer testimonials",
        ],
      },
      brandAnalysis: {
        tone: "Professional and approachable",
        voice: "Local expert and trusted advisor",
        messaging: [
          "Quality service",
          "Community focused",
          "Reliable and trustworthy",
        ],
      },
      conversionAnalysis: {
        currentPath: ["Homepage", "Services", "Contact Form", "Confirmation"],
        recommendations: [
          "Add prominent call-to-action buttons",
          "Simplify contact form",
          "Include customer testimonials",
          "Add live chat feature",
        ],
        projectedImprovement: "25-40% increase in conversion rate",
      },
      contentCalendar: [
        {
          day: "Monday",
          content:
            "Start your week strong! Here's a quick tip for maintaining your equipment.",
          platform: "Facebook",
          hashtags: ["MondayMotivation", "BusinessTips", "LocalBusiness"],
        },
        {
          day: "Tuesday",
          content:
            "Customer spotlight: See how we helped John's restaurant stay running smoothly!",
          platform: "Instagram",
          hashtags: ["CustomerSpotlight", "Success", "LocalSupport"],
        },
        {
          day: "Wednesday",
          content:
            "Did you know? Regular maintenance can extend equipment life by 50%.",
          platform: "LinkedIn",
          hashtags: ["WednesdayWisdom", "MaintenanceTips", "SaveMoney"],
        },
        {
          day: "Thursday",
          content:
            "Behind the scenes: Our team preparing for another busy day of service calls.",
          platform: "Instagram",
          hashtags: ["BehindTheScenes", "TeamWork", "ServiceExcellence"],
        },
        {
          day: "Friday",
          content:
            "Weekend prep checklist: Make sure your equipment is ready for the busy weekend ahead!",
          platform: "Facebook",
          hashtags: ["WeekendPrep", "BusinessTips", "StayReady"],
        },
      ],
      websiteGrade: {
        score: 72,
        improvements: [
          "Add mobile-responsive design",
          "Improve page loading speed",
          "Include customer testimonials",
          "Optimize for local SEO",
          "Add clear call-to-action buttons",
        ],
        roiProjection:
          "Implementing these changes could increase leads by 35-50% within 3 months",
      },
      socialPosts: [
        {
          platform: "Facebook",
          content:
            "🔥 BBQ season is here! Stop by for a propane refill and get grilling! 🍖",
          emojis: "🔥🍖⛽",
        },
        {
          platform: "Instagram",
          content:
            "Safety first! 🛡️ Always store your propane tanks outdoors and upright. #SafetyTips",
          emojis: "🛡️⚠️✅",
        },
        {
          platform: "LinkedIn",
          content:
            "💼 Helping local businesses stay operational with reliable propane services since 1995.",
          emojis: "💼🏢🤝",
        },
        {
          platform: "Twitter",
          content:
            "⚡ Quick tip: Check your propane gauge regularly to avoid running out during peak times!",
          emojis: "⚡📊💡",
        },
      ],
      blogPosts: [
        {
          title: "5 Ways to Improve Your Local Business Visibility",
          outline: [
            "SEO basics",
            "Google My Business",
            "Local directories",
            "Customer reviews",
            "Social media presence",
          ],
          keywords: ["local SEO", "business visibility", "online presence"],
        },
        {
          title: "The Complete Guide to Propane Safety for Businesses",
          outline: [
            "Storage guidelines",
            "Handling procedures",
            "Emergency protocols",
            "Regular inspections",
          ],
          keywords: [
            "propane safety",
            "business safety",
            "equipment maintenance",
          ],
        },
      ],
    };

    return res.status(200).json(comprehensiveAnalysis);
  } catch (error) {
    console.error("Comprehensive analysis error:", error);
    return res.status(500).json({ error: "Analysis generation failed" });
  }
}
