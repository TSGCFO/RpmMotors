# Appraisal E2E Test Plans

These are reference Playwright test plans for the AI Car Price Calculator. Run
them with the `testing` skill (`runTest({ testPlan })`) against the dev server
once Turnstile is set to its test-mode site keys, or against a staging build
where `TURNSTILE_SECRET_KEY` is unset (in which case the server auto-bypasses
Turnstile — see `server/appraisal/turnstile.ts`).

The five scenarios from Task #16 are encoded below. Each plan uses the existing
`data-testid` selectors in `client/src/pages/value-my-car.tsx` and the staff
admin pages.

## Pre-flight (every run)
1. App reachable at `http://localhost:5000`.
2. `DATABASE_URL` points at a throwaway Postgres (the suite writes rows).
3. `ANTHROPIC_API_KEY` set (or pipeline mocked via env — see `__tests__`).
4. `TURNSTILE_SECRET_KEY` unset, **or** Turnstile test-mode site key configured
   so the widget auto-resolves to a passing token.
5. SendGrid: leave `SENDGRID_API_KEY` unset in test runs — the customer email
   path is exercised via DB column `emailSentAt`, not by an actual delivery.

---

## Scenario 1 — Anonymous happy path

```
1. [Browser] Navigate to /value-my-car
2. [Verify] Step indicator shows step 1 "VEHICLE"
3. [Browser] Fill input-year=2020, input-make=Toyota, input-model=Camry
4. [Browser] Fill input-mileage=85000
5. [Browser] Pick select-body-type=Sedan, select-drivetrain=FWD
6. [Browser] Click button-vehicle-next
7. [Browser] Click button-condition-good
8. [Browser] Pick select-accident-history="No accidents",
             select-previous-owners="1", select-service-records="Full records"
9. [Browser] Click button-condition-next
10. [Browser] Fill input-first-name=Test, input-last-name=User,
              input-email=anon+e2e@example.com, input-phone=4165551212
11. [Browser] Leave checkbox-wants-offer UNCHECKED
12. [Browser] Click button-submit-appraisal
13. [Verify] Loading panel visible; LOADING_MESSAGES text rotates and contains
            none of: "AutoTrader", "CarGurus", "Claude", "Anthropic", "OpenAI"
14. [Verify] Within 30s, result panel renders. DOM under [data-testid=result-panel]
            contains exactly: a dollar amount, the confirmation line, and the
            "Start a new appraisal" button. Assert these strings are ABSENT:
            "reasoning", "factor", "confidence", "comp", and the five source
            names above.
15. [DB] SELECT * FROM appraisals ORDER BY id DESC LIMIT 1
        — assert email_sent_at IS NOT NULL and wants_offer = false.
```

## Scenario 2 — Opt-in lead path

Same as Scenario 1 but step 11 → Click checkbox-wants-offer.
After completion:
```
[DB] SELECT * FROM inquiries WHERE appraisal_id = <last appraisal id>
    — assert exactly one row, message contains
      "Internal link: /employee/appraisals/<id>".
```

## Scenario 3 — Staff audit path

```
1. [Browser] Log in at /employee/login as staff (use seeded staff creds).
2. [Browser] Navigate to /employee/appraisals
3. [Browser] Click the most-recent row
4. [Verify] /employee/appraisals/:id renders the reasoning paragraph,
            factor tag chips, internal breakdown card, and comps table.
5. [Verify] Comps table rows each show URL, description excerpt, and
            an accident-signal badge ("clean" / "minor" / "major" / "rebuilt").
```

## Scenario 4 — Bad input

```
- Year out of range: input-year=1800 → button-vehicle-next disabled or inline
  error "Year must be between 1990 and {currentYear+1}"; no /api/appraisals call.
- Malformed email: input-email=notanemail → step-3 submit shows inline error
  on input-email; no POST.
- Missing required field: clear input-make, attempt next → inline "Make is
  required"; no POST.
- After all three: [DB] SELECT count(*) FROM appraisals — unchanged from the
  pre-test value.
```

## Scenario 5 — Rate limit

```
For i in 1..11:
  Submit a fresh appraisal with email=ratelimit+e2e@example.com (vary VIN to
  avoid stage1 cache collisions).
On the 11th submission:
  [Verify] Response is the friendly generic 429 message; loading panel never
           starts; no new DB row past the EMAIL_DAY_LIMIT (10).
```

Note: `EMAIL_DAY_LIMIT=10` and `EMAIL_HOUR_LIMIT=3` in `rate-limit.ts`, so the
4th submission within an hour already trips the email-hour rule. For a clean
"11th fails" assertion either bump the in-process clock or relax the hourly
cap during the test run.
