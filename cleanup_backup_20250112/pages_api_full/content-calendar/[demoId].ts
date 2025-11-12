import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion } from "../../../lib/openai";
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
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: demo, error } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const summary = demo.summary || "";
    const keyItems = demo.key_items || [];
    const websiteUrl = demo.site_url || "";

    // Extract business name
    let businessName = "Business";
    if (summary) {
      const summaryMatch = summary.match(
        /^([A-Z][^.!?]*(?:BBQ|Coffee|Propane|Bakery|Restaurant|Cafe|Shop|Store|Services|Company|Business|Corp|LLC|Inc)[^.!?]*)/i
      );
      if (summaryMatch) {
        businessName = summaryMatch[1].trim();
      }
    }
    if (businessName === "Business" && websiteUrl) {
      const urlMatch = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
      if (urlMatch) {
        businessName = urlMatch[1]
          .split(/[-_]/)
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    const today = new Date();
    const getNextWeekDate = (dayOffset: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const prompt = `Create a 7-day social media content calendar for ${businessName} with SPECIFIC scheduling details:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Create 7 posts with optimal timing and engagement strategies:

Return JSON:
[
  {
    "day": "Monday",
    "date": "${getNextWeekDate(1)}",
    "time": "9:00 AM",
    "content": "Engaging Monday post featuring their specific product/service",
    "platform": "Facebook",
    "hashtags": ["#MondayMotivation", "#BusinessSpecific", "#Local"],
    "postType": "Educational/Promotional/Behind-the-scenes",
    "engagement": "Ask question/Call-to-action/Share story"
  }
]

INCLUDE:
- Optimal posting times for each platform
- Mix of content types (educational, promotional, behind-the-scenes, customer stories)
- Platform-specific engagement strategies
- Business-specific hashtags and content

CRITICAL: Each post must mention their actual business name, products, services, or unique value.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a social media content strategist. Create highly specific, engaging content that showcases the actual business's unique offerings. Never create generic social media posts.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 1000,
      jsonMode: true,
    });

    const calendar = JSON.parse(response);

    return res.status(200).json({
      calendar: Array.isArray(calendar) ? calendar : calendar.posts || [],
    });
  } catch (error) {
    console.error("Content calendar generation error:", error);

    // Fallback content calendar
    const today = new Date();
    const getNextWeekDate = (dayOffset: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return res.status(200).json({
      calendar: [
        {
          day: "Monday",
          date: getNextWeekDate(1),
          time: "9:00 AM",
          content: "Start your week strong! Here's what makes us different.",
          platform: "Facebook",
          hashtags: ["#MondayMotivation", "#LocalBusiness", "#Community"],
          postType: "Motivational",
          engagement: "Ask followers about their Monday goals",
        },
        {
          day: "Tuesday",
          date: getNextWeekDate(2),
          time: "2:00 PM",
          content: "Behind the scenes: Our team's commitment to excellence.",
          platform: "Instagram",
          hashtags: ["#BehindTheScenes", "#TeamWork", "#Quality"],
          postType: "Behind-the-scenes",
          engagement: "Share a team photo or process video",
        },
        {
          day: "Wednesday",
          date: getNextWeekDate(3),
          time: "11:00 AM",
          content: "Midweek spotlight: See how we deliver exceptional value.",
          platform: "LinkedIn",
          hashtags: ["#WednesdayWisdom", "#CustomerFirst", "#BusinessValue"],
          postType: "Educational",
          engagement: "Share customer success story",
        },
        {
          day: "Thursday",
          date: getNextWeekDate(4),
          time: "3:00 PM",
          content:
            "Pro tip: Here's how to get the most value from our services.",
          platform: "Facebook",
          hashtags: ["#ThursdayTips", "#ProTips", "#ValueAdd"],
          postType: "Educational",
          engagement: "Ask for questions in comments",
        },
        {
          day: "Friday",
          date: getNextWeekDate(5),
          time: "4:00 PM",
          content:
            "Weekend ready! We're here to help you make the most of your time.",
          platform: "Instagram",
          hashtags: ["#WeekendReady", "#LocalSupport", "#Service"],
          postType: "Promotional",
          engagement: "Encourage weekend bookings or visits",
        },
        {
          day: "Saturday",
          date: getNextWeekDate(6),
          time: "10:00 AM",
          content:
            "Saturday special: Perfect time to experience what we offer.",
          platform: "Facebook",
          hashtags: ["#SaturdaySpecial", "#WeekendService", "#LocalChoice"],
          postType: "Promotional",
          engagement: "Highlight weekend availability or specials",
        },
        {
          day: "Sunday",
          date: getNextWeekDate(7),
          time: "6:00 PM",
          content:
            "Sunday reflection: Thank you to our community. Here's to another great week ahead!",
          platform: "Instagram",
          hashtags: ["#SundayReflection", "#Grateful", "#Community"],
          postType: "Community",
          engagement: "Thank customers and build community",
        },
      ],
    });
  }
}
