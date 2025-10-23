type WindowEntry = {
  hits: number;
  expiresAt: number;
};

const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 10; // TODO: tune per route

const buckets = new Map<string, WindowEntry>();

export function throttle(key: string) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (entry && entry.expiresAt > now) {
    if (entry.hits >= MAX_HITS) {
      const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
      throw Object.assign(new Error("Too many requests"), { retryAfter });
    }

    entry.hits += 1;
    return;
  }

  buckets.set(key, {
    hits: 1,
    expiresAt: now + WINDOW_MS,
  });
}
