# Little Minds — AI Agent Instructions (Backend)

## 1. Mandatory Product Blueprint

Before starting any implementation, read the latest Product Blueprint:

`docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md`

The Blueprint is the source of truth for product requirements, architecture, security, quality standards, and Definition of Done.

Do not implement behavior that contradicts the Blueprint.

## 2. Jira Task Requirements

Before implementing a task:

- Retrieve the relevant Jira issue using Jira MCP when available.
- Review its description, acceptance criteria, and Epic context.
- Identify the relevant Blueprint requirements.
- Do not invent missing requirements. Ask for clarification when necessary.

## 3. Mandatory Automated Testing — QA-UI-001

Follow Blueprint Section 28.9 for every implementation task.

Backend changes must include appropriate automated tests:

- **Unit Tests:** Business logic, services, validators, and utility functions.
- **Integration Tests:** Database operations, repository behavior, and interactions between modules.
- **API Tests:** Controllers, request validation, authentication, authorization, and error responses.
- **Regression Tests:** Add coverage for fixed defects when feasible.
- **Security Tests:** Verify relevant access-control boundaries, especially parent-child ownership and privileged operations.

Use Jest and the project's approved NestJS testing utilities unless the repository defines another supported framework.

UI tests are not required for backend-only changes that have no UI behavior.

For changes affecting both backend and frontend, ensure relevant API contracts and integration boundaries are tested.

Tests must be implemented as part of the same Jira task and Pull Request.

## 4. Data Protection and Security

- Never commit secrets, API keys, credentials, or production data.
- Never use real children's personal information in automated tests.
- Enforce authentication and authorization on protected endpoints.
- Validate incoming requests.
- Follow the Blueprint's data protection and privacy requirements.
- Use safe, reversible database migrations whenever feasible.

## 5. Git and Pull Request Standards

- Use a dedicated branch for each Jira implementation task.
- Every Jira-linked implementation commit must begin with the actual Jira issue key, followed by a present-tense imperative verb.
- Example: `[LMP-19] Define backend architecture decisions`.
- Include the Jira issue reference and testing evidence in the Pull Request.
- Documentation-only changes without a Jira issue may use the agreed `[DOCS]` prefix.

## 6. CI and Definition of Done

- Run applicable automated tests.
- Ensure required GitHub Actions checks pass.
- Report actual test commands and results.
- Never claim a test passed without executing it.
- Do not mark a Jira task Done until required tests pass and the Pull Request is reviewed and merged.
- Never silently skip required test jobs.

## 7. Agent Operating Rules

- Read the Blueprint and Jira task before changing code.
- Keep implementation within the approved task scope.
- Preserve NestJS architecture and existing project conventions.
- Avoid introducing unnecessary dependencies.
- Request human approval before destructive database operations or irreversible changes.

## 8. Cursor Cloud specific instructions

This repository currently contains product documentation, agent instructions, and a GitHub Actions smoke check. It does not yet contain a NestJS application, `package.json`, Prisma schema, or Docker Compose files. Section 27 of `docs/LITTLE_MINDS_PRODUCT_BLUEPRINT_v2.6.md` describes the future local stack (NestJS API, PostgreSQL, MinIO, Mailpit). Do not invent that stack while working in Cloud Agents, and do not treat a missing dev server as an environment failure.

- Node.js 22 and npm are already on the default image `PATH`, including non-interactive login shells (`bash -lc`). No package install is required.
- The canonical automated check is `.github/workflows/ci.yml`. From the repository root:

```bash
test -f README.md
test -f .github/pull_request_template.md
```

- There is no dev server to start and no database to migrate. `npm install`, `docker compose`, and port `3000` do not apply until those files exist in the repository.
- When the NestJS API and Compose stack are added, replace this section with the real install, boot, and smoke commands from the repository.
