# AEDRYX Public Site + Product Routing Standard

## Objective

AEDRYX is one product with two connected surfaces:

1. PUBLIC MARKETING SITE — explains AEDRYX before authentication.
2. AUTHENTICATED CONSTRUCTION WORKSPACE — the actual AEDRYX construction operating environment.

They share one canonical brand, codebase/deployment, and domain experience.

## Canonical public experience

Root:
`https://www.aedryx.com/`

The root is the public AEDRYX marketing site.

It must not drop an unauthenticated visitor directly into an unexplained internal construction workspace.

The public site contains:
- hero;
- product explanation;
- site-to-structure story;
- visual construction twin;
- workfront orchestration;
- systems/x-ray;
- University/validation;
- future robotics;
- CTA.

OpenArt imagery is allowed only as marketing/editorial imagery and must never be presented as a real AEDRYX renderer screenshot.

## Authenticated product

Preferred canonical route:
`/app`

Supporting auth route:
`/login`

The authenticated AEDRYX workspace remains the real product experience:
- Project;
- Model;
- Materials;
- Schedule;
- Workforce;
- Logistics;
- Quality;
- Systems;
- Inspector;
- timeline/replay;
- construction modes.

Existing deep routes must be preserved or redirected safely so implementation does not break the current product.

If the current router makes `/app` materially unsafe to introduce without churn, preserve existing authenticated routes behind the smallest coherent authenticated shell and document the final route map. Do not duplicate the application.

## Navigation contract

Public marketing header:
- AEDRYX brand;
- product/technology sections;
- Enter AEDRYX / Sign in CTA.

Authenticated workspace:
- persistent AEDRYX identity;
- clear route back to public/product information when appropriate;
- persistent account/profile control;
- secure Sign out.

## Authentication

Unauthenticated access to protected workspace routes must redirect to login/auth entry.

Sign out must terminate/clear the canonical application session as defined in `13_SESSION_LOGOUT_SECURITY.md`.

After logout:
- protected routes are unavailable;
- refresh remains logged out;
- browser Back does not restore usable protected content.

## Deployment model

The public marketing site and authenticated app ship as one tested AEDRYX release unless the existing architecture proves a split deployment is necessary.

Do not maintain two manually divergent product copies.

## Metadata

Public root must use AEDRYX metadata:
- title;
- description;
- canonical URL;
- Open Graph;
- Twitter card;
- favicon/logo.

Authenticated application metadata may be more functional but must use AEDRYX branding rather than stale HERMES outward branding where presentation-facing.

## Acceptance

A new visitor should understand AEDRYX before signing in.

An existing user should be able to:
`aedryx.com → Enter AEDRYX → authenticate → workspace → Sign out → public/login state`

without losing access to the real construction product or creating a second disconnected marketing site.
