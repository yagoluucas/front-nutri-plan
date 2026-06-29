---
name: front-end-security
description: Review Nutri Plan front-end security for non-layout changes in Next.js, React, TypeScript, API routes, authentication, cookies, protected routes, environment variables, data fetching, forms, storage, redirects, and user data handling. Use when a front-end change is not purely visual/design/layout, may affect application or user security, or when asked to audit new or existing vulnerabilities.
---

# Front-end Security

## Review Flow

Use this skill before or after front-end code changes that are not purely visual.

1. Read the project `AGENTS.md` first.
2. Identify whether the change touches auth, user data, API routes, cookies, redirects, forms, validation, environment variables, storage, fetch calls, routing, files, or rendering of user-controlled content.
3. Inspect only the relevant files and nearby call sites. Prefer `rg` for targeted searches.
4. Report security findings first, ordered by severity, with file and line references.
5. If asked to fix issues, keep edits scoped to the security problem and preserve existing UX/design.

## What To Check

- Never store JWTs, secrets, session IDs, or sensitive auth state in `localStorage` or `sessionStorage`.
- Never return JWTs in JSON sent to the browser.
- Keep auth based on `httpOnly` cookies set by Next server-side routes.
- Use `credentials: "include"` for authenticated browser calls.
- Do not build `Authorization: Bearer <token>` in client components or browser services.
- Route protected browser calls through internal Next API routes, not directly to the external API.
- Keep protected-route checks based on the `nutriplan_token` cookie in `src/proxy.ts`.
- Validate request bodies and query params with Zod in internal API routes.
- Sanitize upstream auth payloads so token-like keys such as `token`, `accessToken`, `access_token`, and `jwt` never reach browser JSON.
- Avoid exposing private URLs, keys, or sensitive values through `NEXT_PUBLIC_` variables.
- Validate redirect targets. Allow only safe internal paths and reject protocol-relative URLs such as `//example.com`.
- Use `cache: "no-store"` for auth and sensitive server-side fetches.
- Avoid unsafe rendering such as `dangerouslySetInnerHTML`; if unavoidable, require sanitization.
- Avoid leaking stack traces, tokens, headers, sensitive API errors, or PII in toast messages, API responses, logs, and thrown client errors.
- Confirm logout clears only the `httpOnly` cookie through the server route.

## Useful Searches

Run focused searches when reviewing auth, API routes, or data access:

```bash
rg "localStorage|sessionStorage|persistAuthToken|clearAuthToken|getAuthHeader" src
rg "Authorization|Bearer" src
rg "NEXT_PUBLIC_API_URL|API_URL|process.env" src
rg "cookies\\(|NextResponse|route.ts|credentials" src
rg "dangerouslySetInnerHTML|innerHTML|redirectTo|window.location" src
rg "z.object|safeParse|parse|zodResolver" src
```

`Authorization` should appear only in safe server-side contexts such as internal Next API routes.

## Validation

After relevant fixes, run:

```bash
npm run lint
npm run build
```

If lint fails on unrelated pre-existing issues, state that clearly and still report the security-specific searches that passed.

## Review Output

When reviewing code, lead with findings:

- `P0`: token/session exposure, auth bypass, protected data exposed to unauthenticated users, direct browser access to protected upstream APIs.
- `P1`: missing validation on sensitive routes, unsafe redirects, sensitive error leakage, private env exposure, insecure cookie settings.
- `P2`: incomplete auth-state refresh, weak handling of 401/403, overbroad responses, risky client-side assumptions.
- `P3`: defense-in-depth improvements and follow-up hardening.

If no issues are found, say that clearly and list any residual risk or tests not run.
