/**
 * DISABLED BY DEFAULT — do not enable without an A/B comparison run via
 * the cost-monitoring script.
 *
 * Lever 3 — Strip listing-page HTML before it enters Claude's context
 * (Task #22).
 *
 * `web_fetch` returns the raw HTML of listing pages. The vast majority of
 * that payload (nav, footer, ads, inline scripts/styles) is irrelevant to
 * an appraisal but still counts toward input tokens. When this lever is
 * on, listing HTML is pre-processed by `stripListingHtml()` before being
 * passed back to Claude as the tool result.
 *
 * Implementation note: this is a coarse, dependency-free stripper. It
 * intentionally does NOT parse the DOM (no jsdom/cheerio) so it stays
 * cheap, deterministic, and safe to run inline. The goal is large token
 * reduction, not perfect HTML hygiene.
 */

const NUKE_TAG_RE = /<(script|style|noscript|svg|nav|footer|header|aside|iframe|form)\b[^>]*>[\s\S]*?<\/\1>/gi;
const SELF_CLOSING_NUKE_RE = /<(link|meta|img|input)\b[^>]*\/?>/gi;
const COMMENT_RE = /<!--[\s\S]*?-->/g;
const TAG_RE = /<\/?[a-zA-Z][^>]*>/g;
const WHITESPACE_RE = /\s+/g;

/**
 * Strip noise from listing HTML, returning a compact text-ish body. When
 * `enabled` is false this is a pure pass-through.
 */
export function stripListingHtml(html: string, enabled: boolean): string {
  if (!enabled) return html;
  if (!html) return html;
  let out = html;
  out = out.replace(COMMENT_RE, "");
  out = out.replace(NUKE_TAG_RE, " ");
  out = out.replace(SELF_CLOSING_NUKE_RE, " ");
  out = out.replace(TAG_RE, " ");
  out = out.replace(WHITESPACE_RE, " ").trim();
  return out;
}
