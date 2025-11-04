const BING_API_KEY = process.env.BING_SEARCH_KEY;

export async function fetchBingSerpSnippets(query: string) {
  if (!BING_API_KEY) throw new Error("BING_SEARCH_KEY not set");
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
  });
  if (!res.ok) throw new Error("Bing API error");
  const data = await res.json() as any;
  return {
    topSnippets: data.webPages?.value?.slice(0, 5) || [],
    raw: data,
  };
}
