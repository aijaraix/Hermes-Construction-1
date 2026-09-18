# HERMES AEDRYX LANDING + ACCESS LAUNCH HANDOFF

**Status:** Implementation-ready launch ticket  
**Purpose:** Launch a minimal branded Aedryx landing page and simple private access gate quickly, using the canonical owner-supplied brand asset pack already committed to GitHub.

## 1. Canonical brand source

Owner-supplied asset pack already exists on current \`main\`:

\`AEDRYX_Brand_Asset_Pack.zip\`

Commit that introduced it:

\`bbc90702a7d62a0092dc2dd914901743c23ec8b5\`

Commit message:

\`asset pack for our new comany brand aedryx\`

Do not recreate, replace, redraw, or regenerate the logo/brand assets.

Unpack the ZIP locally during implementation and inspect the complete contents.

Treat the supplied pack as the canonical Aedryx visual identity.

## 2. Immediate objective

Get \`aedryx.com\` ready to feel like a real product entry point as quickly as possible.

Initial experience:

\`\`\`
AEDRYX BRANDED LANDING
        ↓
SIMPLE PIN ACCESS
        ↓
HERMES IMMERSIVE WORKSPACE
\`\`\`

Do not build a large marketing site in this ticket.

## 3. Landing page

The landing page should visually follow the supplied Aedryx board/asset pack.

Primary hero direction:

- dark navy / construction-world background;
- canonical Aedryx logo;
- strong hero visual from the supplied pack;
- headline:
  **Build the physical world with intelligence.**
- supporting message:
  **A construction operating system for the real world.**
- optional supporting line:
  **Living 3D simulation. Embodied AI agents. Site coordination. Real-world execution. Infrastructure intelligence.**
- one primary action:
  **Enter Aedryx**
- PIN entry can appear directly in the hero or in a compact modal after clicking Enter Aedryx.

Keep the first launch elegant and minimal.

## 4. Brand direction

Use only canonical supplied assets where available.

Brand board direction includes:

- Aedryx logo / A mark;
- Abyss Navy;
- Aedryx Blue;
- Signal Amber;
- Concrete White;
- Steel Gray;
- Graphite;
- headline styling consistent with Sora-like geometric typography if supplied/licensed;
- body styling consistent with Inter-like readable typography.

If font files are not supplied or cannot legally be redistributed, use safe web/package equivalents rather than bundling unlicensed font files.

## 5. Do not use the full brand board as the UI

The board is a brand reference, not the landing page itself.

Use its actual extracted assets and visual system.

The landing should feel like the right-side hero section of the board:

- cinematic construction visualization;
- strong dark-to-blue contrast;
- restrained typography;
- Aedryx identity;
- minimal navigation.

## 6. Access gate

Owner wants simple PIN access for the current private phase.

Do not hard-code the owner PIN.

Use deployment secret:

\`HERMES_ACCESS_PIN\`

Server-side PIN verification only.

Recommended flow:

\`POST /api/auth/pin\`

On success:

- signed HTTP-only session cookie;
- Secure in production;
- SameSite=Lax or stricter;
- finite expiration;
- session persists across refresh.

Add:

- simple failed-attempt rate limit/backoff;
- explicit Lock / Sign Out;
- generic invalid-PIN response;
- no PIN logging.

## 7. Public vs protected

Public:

- landing page;
- brand/hero assets;
- PIN form.

Protected:

- immersive HERMES workspace;
- private project state APIs;
- system/developer views.

Do not rely only on client-side hiding.

## 8. Routing

Recommended minimal routing:

\`/\`
→ public Aedryx landing

\`/workspace\`
→ protected HERMES workspace

After successful PIN:

redirect to \`/workspace\`.

If existing SPA routing makes a protected root simpler, preserve the current application structure and use the least invasive route design.

## 9. Relationship to UI-01

This is separate from the immersive HERMES UI-01 refactor.

Do not let the landing-page ticket expand into the workspace redesign.

Likewise, UI-01 should not spend time rebuilding branding assets.

The two tickets can be executed independently and then combined.

## 10. Domain

Canonical public domain:

\`https://aedryx.com\`

Desired behavior later:

- root canonical;
- \`www.aedryx.com\` redirects to root;
- TLS active.

Do not modify DNS until hosting returns the exact custom-domain record requirements.

## 11. Asset handling

During implementation:

1. fetch current \`main\`;
2. confirm \`AEDRYX_Brand_Asset_Pack.zip\` exists;
3. unpack it in the worktree;
4. inventory all files;
5. copy only web-runtime assets needed by the application into an appropriate public/static asset directory;
6. preserve canonical originals;
7. do not commit duplicate variants unless needed for runtime use;
8. document which supplied asset maps to:
   - primary logo;
   - horizontal logo;
   - app icon/favicon;
   - hero image;
   - social/OG image;
   - palette/tokens.

If the ZIP already contains a manifest/guidelines, follow it.

## 12. First-launch acceptance

Pass when:

1. landing page loads quickly;
2. Aedryx logo is crisp;
3. hero is visually strong on desktop;
4. hero remains readable on mobile;
5. primary message is immediately visible;
6. PIN gate works;
7. configured PIN is absent from source/client bundle;
8. unauthorized workspace access is blocked;
9. authenticated refresh persists;
10. lock/sign-out works;
11. workspace opens after login;
12. browser console has no launch-blocking errors.

## 13. Non-goals

Do not build yet:

- full public marketing site;
- pricing;
- customer signup;
- enterprise auth;
- billing;
- blog;
- CMS;
- complex account system;
- customer presentation mode;
- new HERMES modeling features.

## 14. Codex instruction

When assigned:

> Use the owner-supplied \`AEDRYX_Brand_Asset_Pack.zip\` already committed to current main. Do not generate replacement brand assets. Build only the minimal branded landing + PIN access flow required to launch Aedryx quickly. Preserve the existing HERMES application and keep the landing/access change bounded.
