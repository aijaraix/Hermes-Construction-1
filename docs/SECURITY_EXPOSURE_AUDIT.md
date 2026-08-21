# SECURITY EXPOSURE AUDIT PROCEDURES

## Real Payload Exposure Scanning
The Reality Swarm Security Exposure Inspector continuously scans all outgoing client response objects and backend endpoints for credential or key leakage.

## Inspected Items
1. **API Keys**: Scans for raw Gemini or third-party API keys (e.g. `AIzaSy...`).
2. **Database Credentials**: Scans for connection strings (`postgres://`, `mysql://`).
3. **Bearer Tokens**: Scans for unmasked JWT tokens in response bodies.
4. **Stack Traces**: Scans for raw Node.js stack traces (`at Process.ChildProcess...`) in error responses.

## Synthetic Test Marker Verification
To verify the security scanner detects issues accurately during testing without risking real secrets, tests inject `HERMES_TEST_SECRET_DO_NOT_EXPOSE_123` into a controlled server-side test fixture.
- Scan detects test marker -> reports exposure (`clean: false`, `exposuresFound: 1`).
- Test marker removed -> scan re-executed -> reports clean (`clean: true`, `exposuresFound: 0`).
