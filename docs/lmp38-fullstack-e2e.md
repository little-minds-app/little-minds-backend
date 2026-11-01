# LMP-38 — Cross-repository real E2E gate (ADR-023)

## Purpose

Run the actual Next.js parent web app from `little-minds-client` against the actual
NestJS `AppModule`, fake-SMS adapter, and an isolated PostgreSQL 16 service (`little_minds_e2e`).
The test intentionally avoids a mock HTTP backend.

- Jest spec: `test/web-parent-fullstack.e2e-spec.ts`
- Workflow: `.github/workflows/lmp38-fullstack-e2e.yml`
- Pinned client revision in the workflow: `30182cf39223b4903cdcd998ea85c5f7402aea09`
  (client PR #18, integration branch based on merged LMP-25; OpenAPI 0.8.0).
- Coverage: web OTP start/verify through Nest + fake SMS, opaque cookie, real
  protected page/profile, explicit activity, backend logout, idle expiration,
  and denial of stale sessions.

## Configuration required before this gate can execute

The two repositories are private. The default GitHub Actions `GITHUB_TOKEN`
is scoped to one repository and must **not** be presumed to read the sibling
repository. An authorized maintainer must configure in the **backend** repository:

1. **Secret:** `LM_CLIENT_REPO_READ_TOKEN` — a short-lived or rotated GitHub App
   installation token, or fine-grained PAT, with **Contents: read** limited to
   `little-minds-app/little-minds-client`. Do not place the token in Jira, code,
   workflow source, artifacts or logs.
2. **Repository variable:** `LM_ENABLE_CROSS_REPO_E2E=true`. Without it the job
   deliberately reports **skipped**, not green; this does not satisfy E2E acceptance.
3. Confirm backend and client pinned commits still represent the final reviewed
   branch heads; update the pinned revision when the client changes.

After these are configured, trigger or re-run the backend PR workflow and require
the `Real Next + Nest + PostgreSQL OTP E2E` job to **PASS**.

## Limitations

This is a real HTTP integration test, not a full browser test: Node fetch sends
Cookie headers explicitly, and it does not prove real browser HTTPS Secure-cookie
enforcement, cross-browser behavior, deployment proxy trust, or privacy/legal
approvals. These remain separate release gates.

Do not mark LMP-38 Done or merge either draft PR solely because existing
mocked/client and database/backend CI jobs pass.
