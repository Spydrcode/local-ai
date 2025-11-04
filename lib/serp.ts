import fetch from "node-fetch";

const BING_API_KEY = process.env.BING_API_KEY;

export async function fetchBingSerpSnippets(query: string) {
  if (!BING_API_KEY) throw new Error("BING_API_KEY not set");
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": BING_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Bing Search API error");
  const data = (await res.json()) as any;
  // Bing's webPages.value is an array of results
  const topSnippets =
    data.webPages && data.webPages.value
      ? data.webPages.value.slice(0, 5).map((item: any) => ({
          title: item.name,
          snippet: item.snippet,
          link: item.url,
        }))
      : [];
  return {
    topSnippets,
    businessProfile: null, // Bing API does not provide local business profile in standard tier
    raw: data,
  };
}
