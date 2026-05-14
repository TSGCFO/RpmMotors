/**
 * Stage 1 — Market research.
 *
 * Calls Claude with native web_search + web_fetch tools to find Ontario comps
 * on AutoTrader.ca + CarGurus.ca, scrapes full listing descriptions, and
 * returns a strict JSON object validated against Stage1OutputSchema.
 *
 * Firecrawl fallback: only invoked when the native web_fetch blocks/errors
 * for a specific URL. The fallback receives a single URL and returns the
 * fetched HTML/text; Stage 1 attaches the resulting text back into the
 * appropriate comp via a follow-up message to the model.
 */

import { callClaude, parseJsonFromText, type ClaudeCallResult } from "./claude";
import {
  STAGE1_SYSTEM_PROMPT,
  Stage1OutputSchema,
  type Stage1Output,
} from "./prompts";

export interface Stage1Input {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileageKm: number;
  postalCode?: string | null;
}

export interface Stage1Options {
  /**
   * Optional fallback used when Claude's native web_fetch tool reports a
   * block/error on a specific URL. Should return the page text (HTML/markdown).
   */
  firecrawlFetch?: (url: string) => Promise<string>;
  /** Override Claude wrapper config (model, tool versions, tier, …). */
  config?: Parameters<typeof callClaude>[0]["config"];
  /** Override Anthropic client (tests). */
  client?: Parameters<typeof callClaude>[0]["client"];
}

export interface Stage1Result {
  output: Stage1Output;
  modelUsed: string;
  durationMs: number;
  raw: ClaudeCallResult;
}

function buildStage1UserPrompt(input: Stage1Input): string {
  const target = {
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim ?? null,
    mileageKm: input.mileageKm,
    postalCode: input.postalCode ?? null,
  };
  return [
    "TARGET VEHICLE:",
    JSON.stringify(target, null, 2),
    "",
    "Instructions:",
    "1. Search AutoTrader.ca and CarGurus.ca for Ontario listings matching the strict rules.",
    "2. For each candidate, use web_fetch to load the full listing and read the description.",
    "3. Discard mismatched-trim listings; tag accident signals from description text.",
    "4. If fewer than 6 strict comps, widen ONCE (year ±2, mileage ±30%).",
    "5. Also retrieve the latest Statistics Canada CPI all-items index value and the 3-month direction.",
    "6. Return ONE JSON object exactly matching the schema in the system prompt.",
  ].join("\n");
}

/**
 * Inspect the assistant raw content for web_fetch tool blocks that returned
 * an error/block, and return the affected URLs.
 *
 * The Anthropic SDK surfaces server-tool results inline; failed fetches
 * typically appear as content blocks with a non-success indicator.
 */
interface ToolResultBlockShape {
  type?: string;
  name?: string;
  tool_name?: string;
  is_error?: boolean;
  error?: unknown;
  url?: string;
  input?: { url?: string };
  content?: string | { is_error?: boolean; url?: string };
}

function isStringUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

function asToolResultBlock(value: unknown): ToolResultBlockShape | null {
  if (!value || typeof value !== "object") return null;
  // The SDK's ContentBlock union is a structural superset of the fields we
  // probe here, so a narrowing record check is enough — no casts required.
  const rec = value as Record<string, unknown>;
  const out: ToolResultBlockShape = {};
  if (typeof rec.type === "string") out.type = rec.type;
  if (typeof rec.name === "string") out.name = rec.name;
  if (typeof rec.tool_name === "string") out.tool_name = rec.tool_name;
  if (typeof rec.is_error === "boolean") out.is_error = rec.is_error;
  if ("error" in rec) out.error = rec.error;
  if (typeof rec.url === "string") out.url = rec.url;
  if (rec.input && typeof rec.input === "object") {
    const inp = rec.input as Record<string, unknown>;
    if (typeof inp.url === "string") out.input = { url: inp.url };
  }
  if (typeof rec.content === "string") {
    out.content = rec.content;
  } else if (rec.content && typeof rec.content === "object") {
    const c = rec.content as Record<string, unknown>;
    const co: { is_error?: boolean; url?: string } = {};
    if (typeof c.is_error === "boolean") co.is_error = c.is_error;
    if (typeof c.url === "string") co.url = c.url;
    out.content = co;
  }
  return out;
}

export function findBlockedFetchUrls(raw: ClaudeCallResult): string[] {
  const content = raw.raw.content;
  if (!Array.isArray(content)) return [];
  const urls = new Set<string>();
  for (const item of content) {
    const b = asToolResultBlock(item);
    if (!b) continue;
    const isFetchResult =
      (b.type === "server_tool_use" || b.type === "web_fetch_tool_result") &&
      (b.name === "web_fetch" ||
        b.tool_name === "web_fetch" ||
        b.type === "web_fetch_tool_result");
    if (!isFetchResult) continue;
    const contentObj =
      typeof b.content === "object" && b.content !== null ? b.content : undefined;
    const errorish =
      b.is_error === true ||
      b.error !== undefined ||
      contentObj?.is_error === true ||
      (typeof b.content === "string" && /block|forbidden|403|denied/i.test(b.content));
    if (!errorish) continue;
    const candidate = b.input?.url ?? b.url ?? contentObj?.url;
    if (isStringUrl(candidate)) urls.add(candidate);
  }
  return [...urls];
}

export async function runStage1(
  input: Stage1Input,
  options: Stage1Options = {},
): Promise<Stage1Result> {
  const started = Date.now();
  const userPrompt = buildStage1UserPrompt(input);

  const first = await callClaude({
    system: STAGE1_SYSTEM_PROMPT,
    user: userPrompt,
    stage: "stage1",
    config: options.config,
    client: options.client,
  });

  // Detect blocked URLs and, if a Firecrawl fallback is provided, fetch them
  // ourselves and ask the model to re-emit the JSON with the missing pages
  // incorporated.
  const blockedUrls = options.firecrawlFetch ? findBlockedFetchUrls(first) : [];
  let finalResult: ClaudeCallResult = first;
  if (blockedUrls.length && options.firecrawlFetch) {
    const fetched: { url: string; text: string }[] = [];
    for (const url of blockedUrls) {
      try {
        const text = await options.firecrawlFetch(url);
        if (text && text.trim()) {
          // Keep payload bounded.
          fetched.push({ url, text: text.slice(0, 12000) });
        }
      } catch {
        // Silent — best-effort fallback.
      }
    }
    if (fetched.length) {
      const followUp =
        "Some listings could not be fetched directly. Here are their full page contents from our backend:\n\n" +
        fetched
          .map((f, i) => `--- Listing ${i + 1} (${f.url}) ---\n${f.text}`)
          .join("\n\n") +
        "\n\nIncorporate these into your comps where appropriate (apply the same strict matching + description rules) and re-emit the SAME JSON object.";
      finalResult = await callClaude({
        system: STAGE1_SYSTEM_PROMPT,
        user: userPrompt + "\n\n" + followUp,
        stage: "stage1",
        config: options.config,
        client: options.client,
      });
    }
  }

  const parsed = parseJsonFromText<unknown>(finalResult.text);
  const validated = Stage1OutputSchema.parse(parsed);

  return {
    output: validated,
    modelUsed: finalResult.model,
    durationMs: Date.now() - started,
    raw: finalResult,
  };
}
