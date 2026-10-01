# Checkpoint and recovery protocol

Use only the active project-scoped Thin Worker bearer. Keep it in private transient process/storage state; never commit, display to the Owner, copy to another chat or include it in logs/reports.

1. GET `/v1/sentinelx-worker-runner/thin/bootstrap` with the exact source branch. Verify project, role, repository, branch, expected base and source state.
2. GET `/v1/sentinelx-worker-runner/thin/source-artifact` with `source_branch` and `expected_base_sha`. Verify header/body SHA-256 equals bootstrap; extract safely into an isolated source copy.
3. Prepare a complete candidate source tar, preserving modes and all baseline source/runtime bytes except explicitly reviewed implementation paths. Exclude dependencies, builds, caches, credentials and test-generated state. Verify full file closure; do not submit a patch-only tar as a complete tree.
4. POST `/v1/sentinelx-worker-runner/thin/checkpoint` using protocol `acai-thin-gateway/1`, expected_base_sha, target_branch, candidate_artifact_sha256, candidate_artifact_b64, test_status and test_summary. `test_status: PASS` describes passed required engineering checks; explicitly list unavailable physical gates and known untouched baseline failures in the summary. Never mislabel a failed required gate.
5. Require status PRESERVED; record candidate SHA, base, changed_files, Internal Forge head, Recovery manifest SHA-256, Accepted Head, Truth Audit and publication state. Accepted and Forge must equal candidate. No GitHub direct-main write or force push.
6. Re-bootstrap; require new expected base equals candidate and source state ACCEPTED_AND_FORGE. Re-download accepted archive with exact expected base, verify hash and compare all files/modes to submitted candidate; verify change closure against prior accepted tree. Verify exact-child lineage from the authenticated Gateway checkpoint and available non-secret Forge evidence.
7. Record the result in continuity without secrets and carry it into the next milestone's validation record. A self-referential new commit SHA cannot be placed inside its own tree; external checkpoint receipt is authoritative.

Transport retry: retry the SAME immutable candidate digest/base when a response is lost; first reconcile current bootstrap. Do not mint another candidate or ask for new approval merely because an older short session lease expired. Current Gateway restores eligible sessions while the underlying approved grant remains valid. Actual grant expiry/revocation/denial remains a hard stop.

GitHub publication PENDING is not a preservation blocker. Do not claim publication until verified. Do not leave meaningful work only in the ephemeral workspace. If preservation genuinely fails, retain exact candidate/test evidence and record the blocker; do not advance to the next milestone.
