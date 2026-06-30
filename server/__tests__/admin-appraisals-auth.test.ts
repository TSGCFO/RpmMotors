/**
 * Integration test: unauthenticated and spoofed requests to the staff
 * appraisal endpoints must return 401 / 403.
 *
 * Run against a running dev server with:
 *   npx tsx --test server/__tests__/admin-appraisals-auth.test.ts
 *
 * Or point at any host via TEST_BASE_URL.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.TEST_BASE_URL || "http://localhost:5000";

async function probe(method: string, path: string, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, { method, ...init });
}

test("GET /api/admin/appraisals without auth returns 401", async () => {
  const res = await probe("GET", "/api/admin/appraisals");
  assert.equal(res.status, 401, "unauthenticated requests must be rejected");
});

test("GET /api/admin/appraisals with spoofed staff header returns 401", async () => {
  // The middleware must not trust client-provided identity headers.
  const res = await probe("GET", "/api/admin/appraisals", {
    headers: { "x-staff-username": "admin" },
  });
  assert.equal(res.status, 401, "spoofed identity headers must be ignored");
});

test("GET /api/admin/appraisals/1 without auth returns 401", async () => {
  const res = await probe("GET", "/api/admin/appraisals/1");
  assert.equal(res.status, 401);
});

test("PATCH /api/admin/appraisals/1 without auth returns 401", async () => {
  const res = await probe("PATCH", "/api/admin/appraisals/1", {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ staffNotes: "hi" }),
  });
  assert.equal(res.status, 401);
});

test("POST /api/admin/appraisals/1/retry-lead without auth returns 401", async () => {
  const res = await probe("POST", "/api/admin/appraisals/1/retry-lead");
  assert.equal(res.status, 401);
});
