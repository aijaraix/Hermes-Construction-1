# REALITY AUTO-REPAIR POLICY & BOUNDARIES

## Allowed Auto-Repairs
The Reality Swarm is authorized to execute automatic repairs ONLY for non-engineering presentation and binding discrepancies where the canonical owner is unambiguous:
1. Re-aligning UI displayed role counts to match `AgentRegistry`.
2. Updating stale header commit/version badges to match `BuildMetadata`.
3. Updating derived BOM total cost labels when line items sum correctly but display is stale.
4. Downgrading price presentation status to `UNVERIFIED` / `STALE` when evidence expires or is missing.
5. Correcting project context filter bindings.

## Strictly Forbidden Auto-Repairs
Reality Swarm MUST NOT alter technical, structural, or physical engineering values:
- Foundation footing dimensions
- Concrete PSI ratings or beam dimensions
- Rebar sizing and spacing
- Wood truss framing sizes
- Wind uplift anchor fastener counts
- HVAC duct dimensions or airflow CFM
- Electrical panel voltage or wire gauge
- Pipe slope or diameter
- BIM 3D element geometry
- Quantity Takeoff calculated physical amounts
- Building code interpretation outcomes

If an engineering discrepancy is detected, the Reality Swarm creates a `DomainConflictRecord` and escalates to `REALITY_PRIME -> HERMES_PRIME -> DOMAIN_MANAGER`.
