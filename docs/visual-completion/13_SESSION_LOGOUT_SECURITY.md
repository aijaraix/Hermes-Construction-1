# AEDRYX Session / Logout Security Standard

## Objective

A user inside AEDRYX must always have an obvious, reliable way to end the authenticated application session.

## Required UX

Provide a persistent account/profile control reachable from all authenticated workspace views.

It must show enough identity context to make the active account/session understandable and include a clear:

**Sign out**

action.

## Required behavior

Sign out must:
- invoke the existing canonical authentication/session invalidation path;
- clear application authentication state;
- clear stale client/session caches that would recreate access;
- return to the appropriate public/login entry point;
- prevent protected workspace routes from rendering authenticated content after logout;
- prevent refresh/back navigation from silently restoring the prior authenticated workspace.

## Security tests

At minimum:
1. login/session established;
2. protected route accessible;
3. sign out;
4. protected route no longer accessible without authentication;
5. refresh remains signed out;
6. browser back does not reveal active protected state;
7. second tab/session behavior is documented and tested according to current auth architecture.

## Architecture rule

Do not create a second authentication system merely to add logout.

Audit and reuse the existing canonical AEDRYX auth/session mechanism.

If current auth is only front-end persistence without server-backed session invalidation, report that explicitly and implement the strongest correct behavior available within current architecture rather than pretending a server revocation exists.

## Visual placement

Sign out should be discoverable from the normal persistent workspace shell, such as:
- profile/avatar menu;
- account menu;
- user/system menu.

Do not hide it in an obscure settings route.
