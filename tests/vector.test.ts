import { describe, expect, it, vi } from "vitest";

vi.mock("../server/supabaseAdmin", () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  },
}));

import { similaritySearch } from "../lib/vector-utils";

describe("similaritySearch", () => {
  it("returns empty array when no data", async () => {
    const results = await similaritySearch({
      demoId: "demo",
      queryEmbedding: [0.1, 0.2, 0.3],
    });
    expect(results).toEqual([]);
  });
});
