# HERMES AEDRYX ACCESS GATE + DOMAIN ARCHITECTURE

**Status:** Owner-directed access architecture  
**Domain:** aedryx.com  
**Purpose:** Provide a simple branded entry point into the HERMES construction workspace without introducing complex account setup during the current development phase.

## 1. Owner experience

Target flow:

\`\`\`
aedryx.com
  → branded landing page
  → PIN entry
  → authenticated owner session
  → immersive HERMES workspace
\`\`\`

The owner should not need:

- email/password registration;
- OAuth;
- account provisioning;
- MFA during the current internal/private development phase.

## 2. Security rule

The owner-selected PIN must NOT be:

- hard-coded in React;
- committed to GitHub;
- placed in public JavaScript bundles;
- written into documentation;
- logged by the server.

Configure it through a deployment secret/environment variable, for example:

\`\`\`
HERMES_ACCESS_PIN
\`\`\`

## 3. Verification

PIN verification must happen on the server.

Recommended endpoint:

\`\`\`
POST /api/auth/pin
\`\`\`

Request:

\`\`\`json
{ "pin": "<submitted value>" }
\`\`\`

Server:

1. compare against the environment-provided PIN;
2. use constant-time comparison where practical;
3. never echo the configured PIN;
4. never log the submitted PIN;
5. issue a signed session cookie on success.

## 4. Session

Use a secure cookie:

- HTTP-only;
- Secure in production;
- SameSite=Lax or stricter;
- signed;
- finite expiration;
- renewed on normal use if desired.

Recommended session duration for owner convenience:

- 7–30 days on trusted browser.

Provide explicit “Lock / Sign Out”.

## 5. Rate limiting

PIN simplicity requires basic protection.

At minimum:

- limit repeated failed attempts per IP/session;
- short lockout/backoff after repeated failures;
- return generic failure response.

Do not expose whether the configured PIN has a particular length or format.

## 6. Route behavior

Public:

- branded landing page;
- PIN form;
- minimal product introduction if desired.

Protected:

- project workspace;
- project APIs that expose private project state;
- developer/system surfaces.

Server APIs should not rely only on client-side route hiding.

## 7. Current phase

This is a lightweight private-preview/owner gate.

It is not intended to be the final enterprise identity architecture.

Future options:

- named users;
- customer accounts;
- professional roles;
- organization/tenant access;
- SSO;
- MFA;
- audit logging.

Do not build those now.

## 8. Branding boundary

The landing page may use the current Aedryx branding assets.

The immersive construction workspace should inherit enough brand identity to feel cohesive but must remain professional and canvas-dominant.

Do not let a marketing-style homepage layout leak into the project workspace.

## 9. Domain strategy

Primary:

\`https://aedryx.com\`

Recommended:

- root domain is canonical;
- \`www.aedryx.com\` redirects to root;
- landing/PIN lives at root;
- authenticated workspace may remain under root or a path such as \`/workspace\`.

Avoid requiring a separate app subdomain unless later operational needs justify it.

## 10. DNS timing

Do not modify GoDaddy DNS until the intended long-lived HERMES deployment is ready to accept the custom domain.

At domain cutover:

1. add the custom domain in the hosting platform;
2. obtain the exact required DNS records from that platform;
3. add only those records in GoDaddy;
4. verify TLS;
5. verify root and www behavior;
6. verify protected workspace/API access.

Do not guess DNS targets in advance.

## 11. Acceptance

Access is complete when:

1. opening aedryx.com shows branded landing;
2. unauthenticated workspace/API access is blocked;
3. correct owner PIN creates session;
4. incorrect PIN does not;
5. refresh remains authenticated;
6. sign out/lock removes access;
7. PIN is not present in GitHub/client bundle;
8. repeated failures are throttled;
9. mobile and desktop access work;
10. HERMES immersive workspace opens after authentication.
