/**
 * Thin Anthropic SDK wrapper for the appraisal pipeline.
 *
 * - Targets the latest most powerful Opus-tier model; configurable via
 *   `APPRAISAL_MODEL` env var so it can be bumped without code changes.
 * - Enables extended thinking ("high reasoning effort") for both stages.
 * - Enables "fast mode" via Anthropic's `service_tier: "auto"` request
 *   tier (opts into priority routing when available); configurable via
 *   `APPRAISAL_SERVICE_TIER` env var.
 * - Enables native `web_search` + `web_fetch` server tools for Stage 1 only.
 * - Retries on transient errors (429/5xx/network) with exponential backoff.
 *
 * The model id and runtime tuning are configurable via env without code
 * edits; the Anthropic-hosted server tool versions are pinned to specific
 * SDK-typed definitions so they stay type-checked end-to-end:
 *
 *   APPRAISAL_MODEL                  (default "claude-opus-4-5")
 *   APPRAISAL_SERVICE_TIER           ("auto" | "standard_only"; default "auto")
 *   APPRAISAL_THINKING_BUDGET_TOKENS (default 8000)
 *   APPRAISAL_MAX_TOKENS             (default 16000)
 *
 * A runtime guard rejects nonsensical config so misconfiguration fails fast
 * with a clear error instead of an opaque 4xx from the API.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  Message,
  MessageCreateParamsNonStreaming,
  TextBlock,
  ToolUnion,
  WebFetchTool20250910,
  WebSearchTool20250305,
} from "@anthropic-ai/sdk/resources/messages";
import { loadCostLeverFlags } from "./cost-levers.config";

export interface AppraisalClaudeConfig {
  model: string;
  /**
   * Anthropic request-side service tier. `auto` (the default) opts the
   * request into priority routing when the account has priority capacity
   * — this is the "fast mode" for the appraisal pipeline. Set to
   * `standard_only` to force standard tier (e.g. to cap costs).
   */
  serviceTier: "auto" | "standard_only";
  thinkingBudgetTokens: number;
  maxTokens: number;
}

function readEnv(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

function readEnvInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function loadAppraisalClaudeConfig(): AppraisalClaudeConfig {
  const tier = readEnv("APPRAISAL_SERVICE_TIER", "auto");
  if (tier !== "auto" && tier !== "standard_only") {
    throw new Error(
      `APPRAISAL_SERVICE_TIER must be one of auto|standard_only, got "${tier}"`,
    );
  }
  const cfg: AppraisalClaudeConfig = {
    model: readEnv("APPRAISAL_MODEL", "claude-opus-4-5"),
    serviceTier: tier,
    thinkingBudgetTokens: readEnvInt("APPRAISAL_THINKING_BUDGET_TOKENS", 8000),
    maxTokens: readEnvInt("APPRAISAL_MAX_TOKENS", 16000),
  };
  // Defensive validation — keeps misconfiguration loud.
  if (!cfg.model.startsWith("claude-")) {
    throw new Error(`APPRAISAL_MODEL must be an Anthropic Claude model id, got "${cfg.model}"`);
  }
  if (cfg.thinkingBudgetTokens >= cfg.maxTokens) {
    throw new Error("APPRAISAL_THINKING_BUDGET_TOKENS must be less than APPRAISAL_MAX_TOKENS");
  }
  return cfg;
}

/**
 * Stage-1 server tools. Pinned to specific SDK-typed tool versions so the
 * tool definitions stay type-checked end-to-end (no string casts). To bump a
 * tool version, update the type imports and these literals together.
 */
const STAGE1_WEB_SEARCH_TOOL: WebSearchTool20250305 = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 25,
};
const STAGE1_WEB_FETCH_TOOL_DEFAULT_MAX_USES = 25;
function buildStage1WebFetchTool(maxUses: number): WebFetchTool20250910 {
  return {
    type: "web_fetch_20250910",
    name: "web_fetch",
    max_uses: maxUses,
  };
}
function buildStage1Tools(webFetchMaxUses: number): ToolUnion[] {
  return [STAGE1_WEB_SEARCH_TOOL, buildStage1WebFetchTool(webFetchMaxUses)];
}

/** Minimal interface for tests to substitute the Anthropic SDK. */
export interface AnthropicMessagesClient {
  messages: {
    create(
      params: MessageCreateParamsNonStreaming,
    ): Promise<Message>;
  };
}

export const DEFAULT_APPRAISAL_MODEL = loadAppraisalClaudeConfig().model;

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 800;

export interface ClaudeCallOptions {
  system: string;
  user: string;
  stage: "stage1" | "stage2";
  config?: Partial<AppraisalClaudeConfig>;
  client?: AnthropicMessagesClient;
}

export interface ClaudeCallResult {
  text: string;
  model: string;
  stopReason: string | null;
  /**
   * Token counts from the Anthropic Messages API `usage` field. The cache
   * fields are populated only when prompt caching is enabled (currently
   * scaffolded but disabled by default — see server/appraisal/cost.ts).
   */
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    cacheCreationInputTokens?: number;
    cacheReadInputTokens?: number;
  };
  raw: Message;
}

interface TransientErrorShape {
  status?: number;
  response?: { status?: number };
  code?: string;
}

function buildClient(): AnthropicMessagesClient {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — required for the appraisal pipeline.",
    );
  }
  return new Anthropic({ apiKey });
}

function isTransient(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as TransientErrorShape;
  const status = e.status ?? e.response?.status;
  if (status === 429) return true;
  if (typeof status === "number" && status >= 500 && status < 600) return true;
  const code = e.code;
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNABORTED" ||
    code === "EAI_AGAIN"
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function extractText(message: Message): string {
  if (!Array.isArray(message.content)) return "";
  const parts: string[] = [];
  for (const block of message.content) {
    if (block.type === "text") {
      parts.push((block as TextBlock).text);
    }
  }
  return parts.join("\n");
}

/**
 * Call Claude with retries. Returns the final text response after any tool
 * use (Anthropic-hosted `web_search` and `web_fetch` run inline and produce
 * a single final assistant message).
 */
export async function callClaude(
  opts: ClaudeCallOptions,
): Promise<ClaudeCallResult> {
  const baseCfg = loadAppraisalClaudeConfig();
  const cfg: AppraisalClaudeConfig = { ...baseCfg, ...opts.config };
  const client = opts.client ?? buildClient();

  // ---- Cost-reduction levers (Task #22, OFF by default) ----------------
  // Read once per call; flags default to off when env is unset.
  const leverFlags = loadCostLeverFlags();

  // Lever: fetch-cap. When the operator sets APPRAISAL_LEVER_MAX_FETCHES=N,
  // we lower web_fetch.max_uses to min(N, default). When unset → default.
  const webFetchMaxUses =
    leverFlags.fetchCap !== undefined
      ? Math.min(leverFlags.fetchCap, STAGE1_WEB_FETCH_TOOL_DEFAULT_MAX_USES)
      : STAGE1_WEB_FETCH_TOOL_DEFAULT_MAX_USES;

  // Native server tools (Anthropic-hosted) only for Stage 1 research.
  const tools: ToolUnion[] | undefined =
    opts.stage === "stage1" ? buildStage1Tools(webFetchMaxUses) : undefined;

  // Lever: prompt-cache. When APPRAISAL_LEVER_PROMPT_CACHE=1, mark the
  // Stage 1 system prompt with an Anthropic ephemeral cache control block
  // so repeat appraisals pay the cache-read rate ($1.50/Mtok) instead of
  // full input rate ($15/Mtok). Scoped to Stage 1 per spec — the Stage 2
  // system prompt is small and dynamic per appraisal, so caching there has
  // negligible upside. When off, system is sent as a plain string.
  const applyPromptCache = leverFlags.promptCacheEnabled && opts.stage === "stage1";
  const systemParam: MessageCreateParamsNonStreaming["system"] = applyPromptCache
    ? [
        {
          type: "text",
          text: opts.system,
          cache_control: { type: "ephemeral" },
        },
      ]
    : opts.system;

  const request: MessageCreateParamsNonStreaming = {
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    system: systemParam,
    messages: [{ role: "user", content: opts.user }],
    // Extended thinking ≈ "high reasoning effort".
    thinking: {
      type: "enabled",
      budget_tokens: cfg.thinkingBudgetTokens,
    },
    // "Fast mode" — priority service tier for lower latency.
    service_tier: cfg.serviceTier,
    ...(tools ? { tools } : {}),
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create(request);
      const u = response.usage as
        | {
            input_tokens?: number;
            output_tokens?: number;
            cache_creation_input_tokens?: number | null;
            cache_read_input_tokens?: number | null;
          }
        | undefined;
      return {
        text: extractText(response),
        model: cfg.model,
        stopReason: response.stop_reason ?? null,
        usage: {
          inputTokens: u?.input_tokens,
          outputTokens: u?.output_tokens,
          cacheCreationInputTokens: u?.cache_creation_input_tokens ?? undefined,
          cacheReadInputTokens: u?.cache_read_input_tokens ?? undefined,
        },
        raw: response,
      };
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_RETRIES || !isTransient(err)) break;
      const delay = BASE_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 200;
      await sleep(delay);
    }
  }
  throw lastErr;
}

/** Parses a JSON object out of an assistant text block, tolerating prose. */
export function parseJsonFromText<T = unknown>(text: string): T {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Empty model response");
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) return JSON.parse(fenced[1].trim()) as T;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed) as T;
  }
  const firstObj = trimmed.indexOf("{");
  const firstArr = trimmed.indexOf("[");
  const start =
    firstObj < 0 ? firstArr : firstArr < 0 ? firstObj : Math.min(firstObj, firstArr);
  if (start < 0) throw new Error("No JSON found in model response");
  const open = trimmed[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return JSON.parse(trimmed.slice(start, i + 1)) as T;
    }
  }
  throw new Error("Unterminated JSON in model response");
}
