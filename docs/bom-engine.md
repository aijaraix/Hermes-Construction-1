# HERMES Quantity Takeoff & BOM Engine

## Deterministic Quantity Takeoff
`server/deterministicGeometryEngine.ts` calculates precise material quantities directly from component 3D geometry:
- **Concrete Volumetrics**: Concrete volume ($V = L \times W \times H$ in cubic yards) + waste factor.
- **CMU Block Counts**: Surface wall area calculation factoring mortar joints & grout fills.
- **Roofing Surface Area**: Metal panel surface square footage + high-temp WRB membrane underlayment.
- **Pipe / Duct / Wire Lineal Footage**: Direct lineal length sum from BIM routing coordinates.

Each BOM item tracks unit price, price source type, confidence score, and matched local supplier.
