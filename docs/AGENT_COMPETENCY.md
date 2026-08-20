# HERMES CONSTRUCTION — AGENT COMPETENCY TESTING

## Overview
Agents in HERMES Construction cannot self-certify expertise. Before an agent is approved for shadow work or construction work, it must undergo deterministic **Competency Testing** administered by the `LEARNING-COMPETENCY-MANAGER` and relevant Discipline Managers.

---

## Competency Evaluation Domains & Benchmarks

```
   COMPETENCY EVALUATION (Target Minimum: 85.0%)
   ├── Deterministic Calculation Math (e.g. ACI 318 anchor tension, velocity pressure qz)
   ├── Code Compliance Identification (e.g. FBC 1609 wind uplift, NEC 210 GFCI protection)
   ├── Material Compatibility Checks (e.g. Grade 316 SS vs Galvanized in marine exposure)
   ├── Spatial & Trade Clash Detection (e.g. duct path vs structural beam vs plumbing stack)
   └── Inspection Failure Diagnosis (e.g. missing hurricane ties, improper slope)
```

---

## Sample Competency Test Benchmark: Structural Anchor Agent (`FASTENER-UPLIFT-AGENT`)

- **Question/Scenario**: Calculate net design uplift tension $T_{\text{demand}}$ per bolt for a 2-story residence in Tampa, FL ($V = 160\text{ MPH}, K_z = 0.85, K_{zt} = 1.0, K_d = 0.85$). Wall height $20\text{ ft}$, bolt spacing $24"\text{ o.c.}$, roof dead load $12\text{ PSF}$. Compare against allowable capacity of $5/8"$ Grade 316 SS bolt embedded $7"\text{ in } 4000\text{ PSI concrete}$ ($T_{\text{allowable}} = 1,250\text{ LBF}$).
- **Expected Calculation**:
  - $q_z = 0.00256 \times 0.85 \times 1.0 \times 0.85 \times 160^2 = 47.31\text{ PSF}$.
  - Net uplift $p_{\text{uplift}} = 1.5(0.6 \times 47.31 \times 1.4) - 0.6(12) = 59.63 - 7.2 = 52.43\text{ PSF}$.
  - Tributary load per bolt ($2\text{ ft}$ spacing $\times 8\text{ ft}$ overhang/tributary width) $= 838.8\text{ LBF}$.
  - Utilization Ratio $U = 838.8 / 1,250.0 = 0.671 \le 1.0$ (**PASS**).
- **Evaluation**:
  - If agent output matches within $\pm 1\%$ and cites FBC 2023 Section 1609 & ASCE 7-22: **PASS (100% Score)**.
  - If agent fails math or forgets dead load offset: **FAIL (0% Score - Retraining Required)**.
