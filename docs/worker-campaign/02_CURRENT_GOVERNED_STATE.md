# Current governed state

This is the initial campaign anchor, not a promise that live heads never advance. Gateway bootstrap and checkpoint records are current authority. Later accepted stages must add their measured validation records and update campaign metadata without rewriting this historical anchor.

| Field | Observed value |
|---|---|
| Project / role | hermes-construction / application |
| Repository | aijaraix/Hermes-Construction-1; 1340995765 |
| Source and target branch | feature/fnd-01-canonical-identity |
| Initial Accepted Head = Internal Forge | b1cb699637f23b1faf28f0d2eaa90804869d805d |
| Initial recovered archive SHA-256 | cd77b8c0e6da0caa674728f060184aac94ce81bec83b9ddf5c940ee68ecda105 |
| Bootstrap source state | ACCEPTED_AND_FORGE |
| Initial Recovery manifest | sha256:569f3c47ca31f220916a891daae61409baf6437a3a4f83f7f4009babba512ac0 |
| Previous Truth Audit | IN_SYNC |
| GitHub publication | PENDING at prior FND-02 result; not required for preservation |
| Campaign continuity | sxc_903F37FR, initial revision 1 |
| Owner grant | APPROVED observed; always revalidate live status |

Source was downloaded through this scoped Worker and its complete archive hash matched bootstrap before extraction. No .git history was supplied by the archive; do not invent a local ancestor commit. Gateway creates/verifies the exact child on checkpoint.

Baseline revalidation in a disposable recovered copy: FND-02 36, FND-01 7, Academy 4 and visual-gate backend regression 6: **53 PASS**; TypeScript and production build PASS, existing large-chunk warning. Backend visual-gate tests are not pixels or browser evidence.

Known prior reproducible failures: genuine-agent reasoning 6 PASS / 5 FAIL; synthetic PDF fixture expected two pages but observed one (later assertions not reached). These are not green and are not to be weakened. They were not rerun for this documentation-only checkpoint. Reassess only if a milestone touches their boundary or a required gate needs them.

FND-03/04/05 and HX-01/02/03 remain NOT IMPLEMENTED at campaign start. Existing precursor modules must be adapted. Academy vertical-slice runtime is IMPLEMENTED — NOT PHYSICALLY VERIFIED. General spatial reasoning remains PARTIAL; P0 physical acceptance is UNVERIFIED.

No HERMES_TEST_DATABASE_URL is configured in this Worker environment: database integration is NOT RUN — DATABASE UNAVAILABLE. Live-provider gate is NOT RUN until approved configured access and budget are established. Faithful browser/WebGL gate is initially UNVERIFIED, pending a real attempt.

Protected source data includes all `data/` files plus persistence state JSON. In particular retain the eight historical runtime-generated files identified in the frozen Current State document. Never import the two incompatible owners of `data/db/hermes_store.json` as one schema.

## HX-01 implementation update

FND-05 preserved at `67f8f9588c91de65b47c3f24fc2a2b2404ff08e3`; Forge/Accepted aligned, Recovery manifest `8a1f89fe67d087e8c563ac6df3b6e11d65eb9ad43c523298efc701132eeeaa8d`, 344-file recovered source closure PASS. HX-01 now implements the immersive shell and overview; see its measured report and campaign metadata. Browser security policy prevents physical preview; no screenshots or WebGL acceptance. This tree's own checkpoint is determined by its external Gateway receipt. Continue HX-02 only after recovery comparison.

## HX-02 engineering update

HX-01 preserved at `886862ce6332f68fda1d4ef43a0c871fc22b9dc5`; Forge/Accepted aligned, Recovery `96b694ad9a1b73f8d939b378f4afad7fc08c2ae324ab5d0d12ee3b9a9f9cdc92`, recovered 365-file closure PASS. HX-02 implements inspector/attention/timeline with current-record versus replay distinction. 36 UI, 107 foundation, 8 Stage-C checks and typecheck/build PASS. Physical browser remains policy-blocked. Continue HX-03 only after this tree is preserved and recovered.

## HX-03 closing engineering update

HX-02 preserved and independently recovered at `f9d913838bbdf06fec6399ac949843c53b648247`; Forge/Accepted aligned, Recovery `722fc84a1b094bde6bc8d119bfd98ca8531f5dc78adaddc1577935b59fef1db2`, 375-file closure PASS. HX-03 now implements Materials/Schedule/Logistics and legacy truth repairs. 60 UI, 107 foundation and eight Stage-C checks pass, as do typecheck/build; eleven reducer geometry/identity/topology comparisons match the accepted source. Database is NOT RUN — DATABASE UNAVAILABLE; live provider NOT RUN; browser/WebGL BLOCKED / UNVERIFIED. The final source's preservation requires its external Gateway/recovery receipt. See [Final engineering handoff](09_FINAL_ENGINEERING_HANDOFF.md) for ancestry and outstanding acceptance.
