/**
 * Firecrawl fallback for the Stage 1 web_fetch tool.
 *
 * Only invoked when Anthropic's native `web_fetch` returns a block/error for
 * a specific listing URL. Hits the Firecrawl v1 `/scrape` endpoint and
 * returns markdown text for the page, capped to a reasonable length.
 *
 * Returns a no-op function when FIRECRAWL_API_KEY is unset, so the pipeline
 * can run without a Firecrawl account.
 */

import { z } from "zod";

const FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v1/scrape";

/**
 * Tolerant schema for the Firecrawl v1 /scrape response. Firecrawl has
 * historically returned markdown under either `data.markdown`, `data.content`,
 * or a top-level `markdown` field, so we accept all three and pick the
 * first present.
 */
const FirecrawlScrapeResponse = z.object({
  data: z
    .object({
      markdown: z.string().optional(),
      content: z.string().optional(),
    })
    .partial()
    .optional(),
  markdown: z.string().optional(),
});

export type FirecrawlFetchFn = (url: string) => Promise<string>;

export function buildFirecrawlFallback(): FirecrawlFetchFn | undefined {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return undefined;
  return async (url: string): Promise<string> => {
    const res = await fetch(FIRECRAWL_SCRAPE_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    if (!res.ok) {
      throw new Error(`Firecrawl scrape failed ${res.status} for ${url}`);
    }
    const parsed = FirecrawlScrapeResponse.safeParse(await res.json());
    if (!parsed.success) {
      throw new Error(
        `Firecrawl returned unexpected response shape for ${url}: ${parsed.error.message}`,
      );
    }
    const md =
      parsed.data.data?.markdown ??
      parsed.data.data?.content ??
      parsed.data.markdown;
    if (typeof md !== "string" || !md.trim()) {
      throw new Error(`Firecrawl returned empty markdown for ${url}`);
    }
    return md;
  };
}
