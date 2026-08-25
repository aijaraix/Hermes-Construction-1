import {
  ConstructionMethodRecord,
  ConstructionOperationRecord,
  ConstructionHoldPointRecord,
  ConstructionVerificationRecord,
  ConstructionHandoffRecord,
  SpatialActionRecord
} from '../src/types/hermes';

export const ROBOT_ACTION_VOCABULARY = [
  'GO_TO',
  'LOOK_AT',
  'ORIENT',
  'MEASURE',
  'SCAN',
  'MARK',
  'SNAP_LINE',
  'VERIFY_LOCATION',
  'PICK',
  'CARRY',
  'STAGE',
  'PLACE',
  'ALIGN',
  'LEVEL',
  'PLUMB',
  'CUT',
  'DRILL',
  'BORE',
  'FASTEN',
  'TORQUE',
  'WELD',
  'ADHERE',
  'SEAL',
  'CONNECT',
  'ROUTE',
  'SUPPORT',
  'TEST',
  'INSPECT',
  'REMOVE',
  'REPAIR',
  'CLEAN',
  'RELEASE'
] as const;

export type RobotActionPrimitive = typeof ROBOT_ACTION_VOCABULARY[number];

export class ConstructionMethodEngine {
  private static methods: Map<string, ConstructionMethodRecord> = new Map();
  private static spatialActions: SpatialActionRecord[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    // 1. SITE CONTROL & SURVEY LAYOUT
    this.registerMethod({
      methodId: 'METHOD-SURVEY-01',
      name: 'Site Control & High-Precision Survey Layout',
      scope: 'Establish canonical boundary grid, benchmarks, and building corners prior to excavation.',
      applicableAssemblies: ['ASSEMBLY-SITE-01', 'ASSEMBLY-FOUNDATION-01'],
      applicableMaterials: ['SPEC-CONCRETE-3000', 'SPEC-STAKE-WOOD', 'SPEC-MARKING-PAINT'],
      jurisdictionConstraints: ['FBC 2023 Chapter 33 - Site Work', 'Florida Boundary Survey Standard Rule 5J-17'],
      environmentalConstraints: ['Max wind 25 mph during optical station alignment', 'No standing water over benchmark'],
      prerequisites: {
        requiredPriorState: ['SITE_CLEARED', 'PERMIT_ISSUED'],
        requiredSurveyControls: ['BENCHMARK_PRIMARY_BM1'],
        requiredGeometry: ['PLAT_BOUNDARY_POLYGON'],
        requiredInspectionRelease: ['ZONING_SETBACK_RELEASE'],
        requiredMaterialState: ['SURVEY_EQUIPMENT_CALIBRATED']
      },
      resources: {
        materials: ['Wood Stakes', 'Reinforcing Steel Pins', 'High-Visibility Paint'],
        fasteners: ['Masonry Nails'],
        tools: ['Total Station Optical Scanner', 'Laser Level', 'Chalk Line'],
        equipment: ['Tripod Mount', 'Prism Rod'],
        crewRoles: ['Chief Surveyor', 'Instrument Operator', 'Survey Rodperson'],
        specialistAgents: ['SITE-SURVEY-SPECIALIST-01', 'GEOTECHNICAL-SPECIALIST-02']
      },
      spatialRequirements: {
        workZone: 'Zone-Site-Pad-01',
        installationEnvelope: 'Boundary Envelope [50ft x 40ft x 10ft]',
        workerEnvelope: 'Clear Radius 6ft around control points',
        toolEnvelope: 'Unobstructed Line-of-Sight 150ft',
        accessEnvelope: 'Perimeter Access Path 4ft wide',
        stagingArea: 'Site Staging North',
        safetyClearance: '10ft setback from site limits'
      },
      sequence: [
        { operationId: 'OP-SURV-01', name: 'Establish Primary Benchmark', primitiveAction: 'VERIFY_LOCATION', sequenceOrder: 1, assignedActorType: 'SURVEY-ROBOT-01', toolsRequired: ['Total Station'], materialsRequired: ['Steel Pin'], tolerances: '+/- 1.5mm', verificationMethod: 'Optical Check' },
        { operationId: 'OP-SURV-02', name: 'Verify Benchmark Elevation', primitiveAction: 'MEASURE', sequenceOrder: 2, assignedActorType: 'SURVEY-ROBOT-01', toolsRequired: ['Laser Level'], materialsRequired: [], tolerances: '+/- 1.0mm', verificationMethod: 'Differential Leveling' },
        { operationId: 'OP-SURV-03', name: 'Establish Building Grid Lines A-D & 1-5', primitiveAction: 'SNAP_LINE', sequenceOrder: 3, assignedActorType: 'SURVEY-ROBOT-01', toolsRequired: ['Laser Target'], materialsRequired: ['Chalk'], tolerances: '+/- 2.0mm', verificationMethod: 'Diagonal Check' },
        { operationId: 'OP-SURV-04', name: 'Measure Grid Intersections', primitiveAction: 'MEASURE', sequenceOrder: 4, assignedActorType: 'SURVEY-ROBOT-01', toolsRequired: ['Total Station'], materialsRequired: [], tolerances: '+/- 1.5mm', verificationMethod: 'Coordinate Verification' },
        { operationId: 'OP-SURV-05', name: 'Mark Column Center Offset Points', primitiveAction: 'MARK', sequenceOrder: 5, assignedActorType: 'SURVEY-ROBOT-01', toolsRequired: ['Paint Sprayer'], materialsRequired: ['Marking Paint'], tolerances: '+/- 2.0mm', verificationMethod: 'Visual Inspection' },
        { operationId: 'OP-SURV-06', name: 'Verify Diagonal Squareness (Pythagorean 3-4-5)', primitiveAction: 'VERIFY_LOCATION', sequenceOrder: 6, assignedActorType: 'SURVEY-ROBOT-01', toolsRequired: ['Precision Tape'], materialsRequired: [], tolerances: '+/- 2.0mm overall', verificationMethod: '3-4-5 Diagonal Measurement' },
        { operationId: 'OP-SURV-07', name: 'Record Immutable Survey Coordinates', primitiveAction: 'RELEASE', sequenceOrder: 7, assignedActorType: 'SURVEY-LEAD-01', toolsRequired: ['BIM Logger'], materialsRequired: [], tolerances: '100% Match', verificationMethod: 'Digital Sign-off' }
      ],
      holdPoints: [
        { holdPointId: 'HP-SURV-01', operationId: 'OP-SURV-06', description: 'Mandatory Chief Inspector Boundary & Setback Release', requiredInspectorRole: 'INSPECTOR-SITE-01', releaseCriteria: 'All grid intersections within +/- 2mm of BIM Model', isMandatory: true }
      ],
      verifications: [
        { verificationId: 'V-SURV-01', operationId: 'OP-SURV-06', parameterName: 'Diagonal Length Grid A1-D5', expectedValue: '64.031 ft', tolerance: '+/- 0.01 ft', status: 'PENDING' }
      ],
      handoff: {
        fromTradeRole: 'SURVEY-LEAD-01',
        toTradeRole: 'EXCAVATION-SUPERINTENDENT-01',
        releaseConditions: ['Survey grid marked', 'Control pins anchored in concrete'],
        requiredSignoffRecords: ['SIGN-SURV-CERT-01']
      },
      provenance: {
        knowledgeSource: 'Florida Administrative Code 5J-17 Standard Practice',
        codeReference: 'FBC 2023 Section 3301.2',
        manufacturerReference: 'Trimble Robotic Total Station Specs',
        version: '1.0'
      }
    });

    // 2. REINFORCED CONCRETE SLAB / FOUNDATION
    this.registerMethod({
      methodId: 'METHOD-SLAB-01',
      name: 'Monolithic Reinforced Concrete Slab & Footing Assembly',
      scope: 'Structural slab-on-grade execution with integral perimeter turn-down footings, vapor barrier, and rebar grid.',
      applicableAssemblies: ['ASSEMBLY-FOUNDATION-01', 'ASSEMBLY-SLAB-3000PSI'],
      applicableMaterials: ['SPEC-CONCRETE-3000', 'SPEC-REBAR-GRADE60-#4', 'SPEC-VAPOR-BARRIER-15MIL'],
      jurisdictionConstraints: ['ACI 318-19 Structural Concrete Code', 'FBC 2023 Section 1907'],
      environmentalConstraints: ['Pour ambient temp between 40F and 95F', 'Subgrade moisture content 8-12%'],
      prerequisites: {
        requiredPriorState: ['EXCAVATION_COMPLETE', 'SUBGRADE_COMPACTED_95_PERCENT'],
        requiredSurveyControls: ['GRID_LINES_STAKED', 'ELEVATION_BENCHMARK_SET'],
        requiredGeometry: ['FOOTING_TRENCH_EXCAVATED'],
        requiredInspectionRelease: ['SOIL_COMPACTION_RELEASE'],
        requiredMaterialState: ['REBAR_DELIVERED_TESTED', 'VAPOR_BARRIER_STAGED']
      },
      resources: {
        materials: ['Ready-Mix Concrete 3000 PSI', 'Grade 60 #4 Rebar', '15 Mil Stego Wrap Vapor Barrier', 'High-Density Chair Supports'],
        fasteners: ['Tie Wire 16 Gauge', 'Expansion Joints'],
        tools: ['Concrete Screed', 'Vibrator Stinger', 'Power Trowel', 'Rebar Tier'],
        equipment: ['Concrete Pump Truck', 'Compactor Roller'],
        crewRoles: ['Concrete Crew Lead', 'Rebar Installer', 'Finisher'],
        specialistAgents: ['CONCRETE-SPECIALIST-01', 'STRUCTURAL-ENGINEER-01']
      },
      spatialRequirements: {
        workZone: 'Zone-Slab-01',
        installationEnvelope: 'Slab Area [40ft x 30ft x 0.5ft]',
        workerEnvelope: 'Clear Zone 4ft surrounding slab perimeter',
        toolEnvelope: 'Pump Boom Clearance 30ft vertical',
        accessEnvelope: 'Pump Truck Drive Access 12ft wide',
        stagingArea: 'Concrete Washout & Staging Area West',
        safetyClearance: '15ft radius around concrete pump hopper'
      },
      sequence: [
        { operationId: 'OP-SLAB-01', name: 'Verify Subgrade Compaction & Moisture', primitiveAction: 'MEASURE', sequenceOrder: 1, assignedActorType: 'SOILS-ACTOR-01', toolsRequired: ['Nuclear Density Gauge'], materialsRequired: [], tolerances: '95% Modified Proctor', verificationMethod: 'Density Test' },
        { operationId: 'OP-SLAB-02', name: 'Erect Perimeter Edge Formwork', primitiveAction: 'PLACE', sequenceOrder: 2, assignedActorType: 'FORM-ACTOR-01', toolsRequired: ['Laser Level', 'Hammer'], materialsRequired: ['2x8 Lumber', 'Form Stakes'], tolerances: '+/- 1/8 inch', verificationMethod: 'Elevation Check' },
        { operationId: 'OP-SLAB-03', name: 'Lay 15-Mil Vapor Barrier with Sealed Lap Joints', primitiveAction: 'ADHERE', sequenceOrder: 3, assignedActorType: 'WATERPROOF-ACTOR-01', toolsRequired: ['Seam Tape Roller'], materialsRequired: ['15 Mil Barrier', 'Vapor Tape'], tolerances: 'Minimum 6 inch lap', verificationMethod: 'Visual Leak Check' },
        { operationId: 'OP-SLAB-04', name: 'Place Rebar Grid #4 @ 12" OC on High Chairs', primitiveAction: 'PLACE', sequenceOrder: 4, assignedActorType: 'REBAR-ACTOR-01', toolsRequired: ['Tie Wire Gun'], materialsRequired: ['#4 Rebar', 'Rebar Chairs', 'Tie Wire'], tolerances: '+/- 1/4 inch elevation', verificationMethod: 'Clear Cover Check (3 inch minimum)' },
        { operationId: 'OP-SLAB-05', name: 'Layout Anchor Systems (Support Alternate Methods: CIP, Mechanical, Epoxy, Welded)', primitiveAction: 'ALIGN', sequenceOrder: 5, assignedActorType: 'ANCHOR-ACTOR-01', toolsRequired: ['Anchor Template'], materialsRequired: ['5/8" Anchor Bolts'], tolerances: '+/- 1/16 inch center', verificationMethod: 'Template Verification' },
        { operationId: 'OP-SLAB-06', name: 'Pre-Pour Inspector Hold Point Signoff', primitiveAction: 'INSPECT', sequenceOrder: 6, assignedActorType: 'INSPECTOR-STRUCT-01', toolsRequired: ['Inspection Checklist'], materialsRequired: [], tolerances: '100% Code Compliance', verificationMethod: 'Signed Permit Ticket' },
        { operationId: 'OP-SLAB-07', name: 'Discharge and Vibration Placement of Concrete', primitiveAction: 'PLACE', sequenceOrder: 7, assignedActorType: 'CONCRETE-PUMP-OPERATOR', toolsRequired: ['Concrete Vibrator Stinger'], materialsRequired: ['3000 PSI Mix'], tolerances: 'Continuous Pour', verificationMethod: 'Slump Test (4" +/- 1")' },
        { operationId: 'OP-SLAB-08', name: 'Screed, Float, Trowel & Apply Wet Cure Blanket', primitiveAction: 'SEAL', sequenceOrder: 8, assignedActorType: 'FINISHER-ACTOR-01', toolsRequired: ['Power Trowel', 'Bull Float'], materialsRequired: ['Curing Compound'], tolerances: 'FF 30 / FL 20 Flatness', verificationMethod: 'Straightedge Test' }
      ],
      holdPoints: [
        { holdPointId: 'HP-SLAB-01', operationId: 'OP-SLAB-06', description: 'Structural Engineer Pre-Pour Rebar & Anchor Release', requiredInspectorRole: 'INSPECTOR-STRUCT-01', releaseCriteria: 'Rebar elevation, clearance cover, and anchor locations verified', isMandatory: true }
      ],
      verifications: [
        { verificationId: 'V-SLAB-01', operationId: 'OP-SLAB-07', parameterName: 'Concrete Slump', expectedValue: '4.0 inches', tolerance: '+/- 1.0 inch', status: 'PENDING' }
      ],
      handoff: {
        fromTradeRole: 'CONCRETE-SUPERINTENDENT-01',
        toTradeRole: 'FRAMING-SUPERINTENDENT-01',
        releaseConditions: ['Concrete compressive strength reaches 2500 PSI', 'Forms stripped'],
        requiredSignoffRecords: ['CYLINDER-TEST-REPORT-01']
      },
      provenance: {
        knowledgeSource: 'ACI 318-19 Building Code Requirements for Structural Concrete',
        codeReference: 'FBC 2023 Section 1907.1',
        manufacturerReference: 'Stego Wrap 15-Mil Installation Guidelines',
        version: '1.0'
      }
    });

    // 3. STRUCTURAL STEEL COLUMN INSTALLATION
    this.registerMethod({
      methodId: 'METHOD-STEEL-01',
      name: 'Structural Steel Column Erection & Anchorage',
      scope: 'Erection of heavy wide-flange steel columns onto foundation anchor bolt assemblies with leveling shims and high-strength non-shrink grout.',
      applicableAssemblies: ['ASSEMBLY-STEEL-FRAME-01'],
      applicableMaterials: ['SPEC-STEEL-W8X31', 'SPEC-GROUT-NONSHRINK', 'SPEC-BOLT-A325'],
      jurisdictionConstraints: ['AISC 360-16 Specification for Structural Steel Buildings', 'OSHA 1926.755 Steel Erection'],
      environmentalConstraints: ['Max wind speed 20 mph for crane hoisting', 'No lightning within 10 miles'],
      prerequisites: {
        requiredPriorState: ['FOUNDATION_CURING_COMPLETE', 'ANCHOR_BOLTS_VERIFIED'],
        requiredSurveyControls: ['COLUMN_CENTERLINE_SURVEYED'],
        requiredGeometry: ['BASE_PLATE_HOLE_PATTERN_MATCHED'],
        requiredInspectionRelease: ['FOUNDATION_CONCRETE_STRENGTH_RELEASE'],
        requiredMaterialState: ['COLUMNS_INSPECTED_FABRICATED']
      },
      resources: {
        materials: ['W8x31 A992 Steel Column', 'High-Strength Non-Shrink Grout', 'Steel Shims'],
        fasteners: ['A325 3/4" Structural Bolts', 'Heavy Hex Nuts'],
        tools: ['Impact Wrench', 'Torque Wrench', 'Plumb Bob', 'Magnetic Laser Level'],
        equipment: ['Mobile Crane 25-Ton', 'Rigging Slings', 'Manlift Aerial Work Platform'],
        crewRoles: ['Crane Operator', 'Ironworker Rigger', 'Connector'],
        specialistAgents: ['STEEL-SPECIALIST-01', 'SAFETY-OFFICER-01']
      },
      spatialRequirements: {
        workZone: 'Zone-Structure-GridB4',
        installationEnvelope: 'Vertical Height [12ft x 2ft x 2ft]',
        workerEnvelope: 'Aerial Basket Radius 8ft',
        toolEnvelope: 'Impact Wrench Operating Clearance 3ft',
        accessEnvelope: 'Crane Outrigger Footprint [15ft x 15ft]',
        stagingArea: 'Steel Unloading Bay South',
        safetyClearance: 'Fall Hazard Exclusion Zone 25ft'
      },
      sequence: [
        { operationId: 'OP-STEEL-01', name: 'Verify Grid & Locate Anchor Bolt Center', primitiveAction: 'VERIFY_LOCATION', sequenceOrder: 1, assignedActorType: 'SURVEY-ACTOR-01', toolsRequired: ['Laser Target'], materialsRequired: [], tolerances: '+/- 1/16 inch', verificationMethod: 'Optical Survey' },
        { operationId: 'OP-STEEL-02', name: 'Mark Base Plate Perimeter & Leveling Pack', primitiveAction: 'MARK', sequenceOrder: 2, assignedActorType: 'RIGGER-ACTOR-01', toolsRequired: ['Chalk Line'], materialsRequired: ['Steel Shim Pack'], tolerances: '+/- 1/32 inch level', verificationMethod: 'Precision Level' },
        { operationId: 'OP-STEEL-03', name: 'Rig, Lift & Stage Structural Column', primitiveAction: 'PICK', sequenceOrder: 3, assignedActorType: 'CRANE-RIGGER-01', toolsRequired: ['Rigging Slings'], materialsRequired: ['W8x31 Steel Column'], tolerances: 'Smooth hoisting', verificationMethod: 'Tag Line Control' },
        { operationId: 'OP-STEEL-04', name: 'Position Base Plate over Anchor Bolt Pattern', primitiveAction: 'PLACE', sequenceOrder: 4, assignedActorType: 'CONNECTOR-ACTOR-01', toolsRequired: ['Guide Pins'], materialsRequired: [], tolerances: '+/- 1/16 inch entry', verificationMethod: 'Visual Guidance' },
        { operationId: 'OP-STEEL-05', name: 'Plumb Column & Install Temporary Bracing', primitiveAction: 'PLUMB', sequenceOrder: 5, assignedActorType: 'CONNECTOR-ACTOR-01', toolsRequired: ['Optical Transit', 'Guy Wire Winch'], materialsRequired: ['Guy Wires'], tolerances: 'Plumb within 1:500 ratio', verificationMethod: 'Dual-Axis Transit Survey' },
        { operationId: 'OP-STEEL-06', name: 'Fasten Anchor Nuts & Torque to Specification', primitiveAction: 'TORQUE', sequenceOrder: 6, assignedActorType: 'CONNECTOR-ACTOR-01', toolsRequired: ['Calibrated Torque Wrench'], materialsRequired: ['A325 Bolts'], tolerances: '320 ft-lbs torque', verificationMethod: 'Torque Audit Inspection' },
        { operationId: 'OP-STEEL-07', name: 'Pack Non-Shrink Grout Bed Under Base Plate', primitiveAction: 'SEAL', sequenceOrder: 7, assignedActorType: 'GROUT-ACTOR-01', toolsRequired: ['Grout Pump / Trowel'], materialsRequired: ['Non-Shrink Grout'], tolerances: 'Zero voids under plate', verificationMethod: 'Sounding Test' },
        { operationId: 'OP-SLAB-08', name: 'Independent Structural Inspection Signoff', primitiveAction: 'INSPECT', sequenceOrder: 8, assignedActorType: 'INSPECTOR-STEEL-01', toolsRequired: ['Ultrasonic Tester'], materialsRequired: [], tolerances: '100% AISC Compliance', verificationMethod: 'Inspection Certificate' }
      ],
      holdPoints: [
        { holdPointId: 'HP-STEEL-01', operationId: 'OP-STEEL-06', description: 'Plumb & Torque Inspection Before Crane Release', requiredInspectorRole: 'INSPECTOR-STEEL-01', releaseCriteria: 'Column plumb within 1:500, torque values certified', isMandatory: true }
      ],
      verifications: [
        { verificationId: 'V-STEEL-01', operationId: 'OP-STEEL-05', parameterName: 'Column Out-of-Plumbness', expectedValue: '0.00 inches', tolerance: '+/- 0.125 inches', status: 'PENDING' }
      ],
      handoff: {
        fromTradeRole: 'STEEL-SUPERINTENDENT-01',
        toTradeRole: 'MEP-SUPERINTENDENT-01',
        releaseConditions: ['Column grout fully cured (5000 PSI)', 'Bracing verified'],
        requiredSignoffRecords: ['STEEL-ERECTION-RELEASE-01']
      },
      provenance: {
        knowledgeSource: 'AISC 360-16 Code of Standard Practice',
        codeReference: 'FBC 2023 Section 2205',
        manufacturerReference: 'Five Star Non-Shrink Grout Spec Sheet',
        version: '1.0'
      }
    });

    // 4. WOOD FRAMED EXTERIOR WALL
    this.registerMethod({
      methodId: 'METHOD-WOOD-01',
      name: 'Engineered Wood Exterior Bearing Wall Framing',
      scope: 'Layout, stud layout, header installation, sheathing attachment, hold-down fastening, wall lift, and structural bracing.',
      applicableAssemblies: ['ASSEMBLY-WALL-WOOD-01'],
      applicableMaterials: ['SPEC-LUMBER-2X6', 'SPEC-PLYWOOD-7-16', 'SPEC-NAILS-10D', 'SPEC-HOLDDOWN-HD2A'],
      jurisdictionConstraints: ['NDS for Wood Construction 2018', 'FBC 2023 High-Velocity Hurricane Zone (HVHZ) Section 2314'],
      environmentalConstraints: ['Lumber moisture content <= 19%', 'Protect sheathing from direct rain during assembly'],
      prerequisites: {
        requiredPriorState: ['SLAB_CURING_COMPLETE', 'MUDSILL_ANCHORED'],
        requiredSurveyControls: ['SNAP_LINE_WALL_LAYOUT'],
        requiredGeometry: ['ROUGH_OPENINGS_VERIFIED'],
        requiredInspectionRelease: ['MUDSILL_ANCHOR_INSPECTION_RELEASE'],
        requiredMaterialState: ['FRAMING_LUMBER_DELIVERED']
      },
      resources: {
        materials: ['2x6 SPF #2 Lumber', '7/16 OSB Exterior Sheathing', 'Simpson HD2A Hold-Downs'],
        fasteners: ['10d Common Nails', '5/8" Anchor Bolts', 'SDS Heavy-Duty Screws'],
        tools: ['Pneumatic Framing Nailer', 'Pneumatic Sheathing Stapler', 'Laser Plumb Level', 'Wall Jacks'],
        equipment: ['Wall Lifting Jack Set'],
        crewRoles: ['Framing Lead', 'Layout Carpenter', 'Sheathing Installer'],
        specialistAgents: ['WOOD-FRAMING-SPECIALIST-01', 'STRUCTURAL-ENGINEER-01']
      },
      spatialRequirements: {
        workZone: 'Zone-Wall-Exterior-South',
        installationEnvelope: 'Slab Floor Assembly Footprint [30ft x 9ft x 0.5ft]',
        workerEnvelope: 'Clear Floor Working Radius 5ft',
        toolEnvelope: 'Nailer Hose Radius 25ft',
        accessEnvelope: 'Wall Tilting Sweep Arc 10ft',
        stagingArea: 'Lumber Rack Zone East',
        safetyClearance: '10ft drop zone below wall tilt arc'
      },
      sequence: [
        { operationId: 'OP-WOOD-01', name: 'Snap Exterior Wall Plate Reference Line', primitiveAction: 'SNAP_LINE', sequenceOrder: 1, assignedActorType: 'CARPENTER-ACTOR-01', toolsRequired: ['Chalk Line'], materialsRequired: ['Chalk'], tolerances: '+/- 1/16 inch', verificationMethod: 'Tape Measurement' },
        { operationId: 'OP-WOOD-02', name: 'Layout Top, Bottom & Treated Mudsill Plates', primitiveAction: 'MARK', sequenceOrder: 2, assignedActorType: 'CARPENTER-ACTOR-01', toolsRequired: ['Framing Square'], materialsRequired: ['2x6 Plates'], tolerances: '+/- 1/16 inch studs @ 16" OC', verificationMethod: 'Layout Check' },
        { operationId: 'OP-WOOD-03', name: 'Nail Studs, King Studs, Jacks & Window Headers', primitiveAction: 'FASTEN', sequenceOrder: 3, assignedActorType: 'NAILER-ACTOR-01', toolsRequired: ['Pneumatic Nailer'], materialsRequired: ['2x6 Lumber', '10d Nails'], tolerances: 'Flush joints', verificationMethod: 'Visual Check' },
        { operationId: 'OP-WOOD-04', name: 'Attach OSB Sheathing with Wind Uplift Nail Schedule', primitiveAction: 'FASTEN', sequenceOrder: 4, assignedActorType: 'NAILER-ACTOR-01', toolsRequired: ['Sheathing Nailer'], materialsRequired: ['7/16 OSB', '8d Ring Shank Nails'], tolerances: '6 inch edge / 12 inch field', verificationMethod: 'Nail Spacing Gauge' },
        { operationId: 'OP-WOOD-05', name: 'Attach Simpson Hold-Down Brackets to Corner Studs', primitiveAction: 'FASTEN', sequenceOrder: 5, assignedActorType: 'CARPENTER-ACTOR-01', toolsRequired: ['Impact Driver'], materialsRequired: ['HD2A Hold-Down', 'SDS Screws'], tolerances: '100% screw seating', verificationMethod: 'Torque Check' },
        { operationId: 'OP-WOOD-06', name: 'Raise Wall Assembly & Align with Anchor Bolts', primitiveAction: 'PLACE', sequenceOrder: 6, assignedActorType: 'LIFT-CREW-01', toolsRequired: ['Wall Jacks'], materialsRequired: [], tolerances: 'Aligned to chalk line', verificationMethod: 'Visual Line Check' },
        { operationId: 'OP-WOOD-07', name: 'Plumb, Square, and Install Temporary Diagonal Bracing', primitiveAction: 'PLUMB', sequenceOrder: 7, assignedActorType: 'CARPENTER-ACTOR-01', toolsRequired: ['6ft Spirit Level', 'Laser Level'], materialsRequired: ['2x4 Bracing'], tolerances: '+/- 1/8 inch full height', verificationMethod: 'Dual Plumb Bob Check' },
        { operationId: 'OP-WOOD-08', name: 'Inspect Framing & Fastener Schedule', primitiveAction: 'INSPECT', sequenceOrder: 8, assignedActorType: 'INSPECTOR-FRAMING-01', toolsRequired: ['Inspection Gauge'], materialsRequired: [], tolerances: 'FBC 2023 HVHZ Compliant', verificationMethod: 'Framing Permit Pass' }
      ],
      holdPoints: [
        { holdPointId: 'HP-WOOD-01', operationId: 'OP-WOOD-08', description: 'Rough Framing & Nailing Schedule Inspection', requiredInspectorRole: 'INSPECTOR-FRAMING-01', releaseCriteria: 'All sheathing nails, hold-downs, and plate bolts verified', isMandatory: true }
      ],
      verifications: [
        { verificationId: 'V-WOOD-01', operationId: 'OP-WOOD-04', parameterName: 'Sheathing Nail Spacing Edge', expectedValue: '6.0 inches', tolerance: '+/- 0.5 inches', status: 'PENDING' }
      ],
      handoff: {
        fromTradeRole: 'FRAMING-SUPERINTENDENT-01',
        toTradeRole: 'ROOFING-SUPERINTENDENT-01',
        releaseConditions: ['Exterior walls plumb, braced, and top double-plate locked'],
        requiredSignoffRecords: ['ROUGH-FRAMING-PASSED-01']
      },
      provenance: {
        knowledgeSource: 'NDS National Design Specification for Wood Construction',
        codeReference: 'FBC 2023 Section 2314 (HVHZ Wall Framing)',
        manufacturerReference: 'Simpson Strong-Tie Wood Construction Catalog',
        version: '1.0'
      }
    });

    // Register methods 5 through 10 (Roof, DWV, Water, Elec, HVAC, Envelope)
    this.registerRemainingMethods();

    this.initialized = true;
  }

  private static registerRemainingMethods(): void {
    // 5. ROOF ASSEMBLY
    this.registerMethod({
      methodId: 'METHOD-ROOF-01',
      name: 'Engineered Wood Roof Truss Erection & Decking',
      scope: 'Truss hoisting, hurricane tie attachment, OSB roof sheathing, synthetic underlayment, and drip edge.',
      applicableAssemblies: ['ASSEMBLY-ROOF-TRUSS-01'],
      applicableMaterials: ['SPEC-TRUSS-PREFAB', 'SPEC-PLYWOOD-5-8', 'SPEC-UNDERLAYMENT-SYNTHETIC'],
      jurisdictionConstraints: ['FBC 2023 Section 1507', 'TAS 107 Wind Resistance Standard'],
      environmentalConstraints: ['Max wind 15 mph during truss hoisting', 'Dry roof deck for underlayment application'],
      prerequisites: { requiredPriorState: ['WALL_FRAMING_PASSED'], requiredSurveyControls: ['TRUSS_BEARING_POINTS_MARKED'], requiredGeometry: ['WALL_DOUBLE_PLATE_LEVEL'], requiredInspectionRelease: ['FRAMING_RELEASE'], requiredMaterialState: ['TRUSSES_DELIVERED_INSPECTED'] },
      resources: { materials: ['Prefab Trusses', '5/8" CDX Plywood', 'Synthetic Underlayment'], fasteners: ['Simpson H2.5A Ties', '8d Ring Shank Nails'], tools: ['Crane Slings', 'Nailer'], equipment: ['Mobile Crane'], crewRoles: ['Rigger', 'Truss Setter', 'Sheather'], specialistAgents: ['STRUCTURAL-ENGINEER-01'] },
      spatialRequirements: { workZone: 'Zone-Roof-Top', installationEnvelope: 'Roof Envelope [40ft x 30ft x 8ft]', workerEnvelope: 'Tie-off Radius 10ft', toolEnvelope: 'Crane Hook Clearance 40ft', accessEnvelope: 'Scaffold Tower Access East', stagingArea: 'Ground Staging South', safetyClearance: 'Harness Tie-off mandatory above 6ft' },
      sequence: [
        { operationId: 'OP-ROOF-01', name: 'Layout Truss Centers on Top Plate @ 24" OC', primitiveAction: 'MARK', sequenceOrder: 1, assignedActorType: 'CARPENTER-ACTOR-01', toolsRequired: ['Tape Measure'], materialsRequired: [], tolerances: '+/- 1/8 inch', verificationMethod: 'Visual Check' },
        { operationId: 'OP-ROOF-02', name: 'Hoist and Position Gable & Interior Trusses', primitiveAction: 'PICK', sequenceOrder: 2, assignedActorType: 'CRANE-RIGGER-01', toolsRequired: ['Crane Slings'], materialsRequired: ['Trusses'], tolerances: 'Plumb within 1/4 inch', verificationMethod: 'Plumb Bob Check' },
        { operationId: 'OP-ROOF-03', name: 'Install Simpson H2.5A Hurricane Ties at Bearing', primitiveAction: 'FASTEN', sequenceOrder: 3, assignedActorType: 'NAILER-ACTOR-01', toolsRequired: ['Connector Nailer'], materialsRequired: ['H2.5A Ties', 'Tico Nails'], tolerances: '100% nail holes filled', verificationMethod: 'Fastener Inspection' },
        { operationId: 'OP-ROOF-04', name: 'Attach Roof OSB Decking with H-Clips', primitiveAction: 'FASTEN', sequenceOrder: 4, assignedActorType: 'SHEATHER-ACTOR-01', toolsRequired: ['Pneumatic Sheathing Nailer'], materialsRequired: ['5/8 OSB', 'H-Clips'], tolerances: '6 inch edge / 12 inch field', verificationMethod: 'Nail Spacing Test' },
        { operationId: 'OP-ROOF-05', name: 'Roll & Fasten Self-Adhering Synthetic Underlayment', primitiveAction: 'SEAL', sequenceOrder: 5, assignedActorType: 'ROOFER-ACTOR-01', toolsRequired: ['Underlayment Roller'], materialsRequired: ['Synthetic Felt'], tolerances: '4 inch lap seam', verificationMethod: 'Waterproofing Inspection' }
      ],
      holdPoints: [{ holdPointId: 'HP-ROOF-01', operationId: 'OP-ROOF-05', description: 'Roof Dry-In & Hurricane Tie Signoff', requiredInspectorRole: 'INSPECTOR-ROOF-01', releaseCriteria: 'Underlayment sealed, hurricane ties verified', isMandatory: true }],
      verifications: [{ verificationId: 'V-ROOF-01', operationId: 'OP-ROOF-03', parameterName: 'Hurricane Tie Nailing', expectedValue: '10 nails per tie', tolerance: '0 missing nails', status: 'PENDING' }],
      handoff: { fromTradeRole: 'ROOFING-SUPERINTENDENT-01', toTradeRole: 'MEP-SUPERINTENDENT-01', releaseConditions: ['Building dried in'], requiredSignoffRecords: ['DRYIN-PASSED-01'] },
      provenance: { knowledgeSource: 'FBC Roof Assembly Standards', codeReference: 'FBC 2023 Section 1507', manufacturerReference: 'Truss Plate Institute Manual', version: '1.0' }
    });

    // 6. PLUMBING DWV
    this.registerMethod({
      methodId: 'METHOD-DWV-01',
      name: 'PVC Drain-Waste-Vent (DWV) Underground & Rough-In',
      scope: 'Sewer main connection, building drain routing, stack vents, fixture traps, and 10ft head pressure test.',
      applicableAssemblies: ['ASSEMBLY-PLUMB-DWV-01'],
      applicableMaterials: ['SPEC-PIPE-PVC-4IN', 'SPEC-PIPE-PVC-2IN', 'SPEC-CEMENT-PVC-PURPLE'],
      jurisdictionConstraints: ['Florida Plumbing Code 2023 Chapter 7', 'IPC 2021 Table 704.1'],
      environmentalConstraints: ['Pipe primer/cement application temp above 40F'],
      prerequisites: { requiredPriorState: ['FRAMING_COMPLETE', 'ROOF_DRYIN_PASSED'], requiredSurveyControls: ['SLOPE_BENCHMARK_SET'], requiredGeometry: ['FIXTURE_STUB_LOCATIONS_MARKED'], requiredInspectionRelease: ['SLAB_ROUGH_IN_RELEASE'], requiredMaterialState: ['PVC_PIPE_STAGED'] },
      resources: { materials: ['4" PVC DWV Pipe', '2" PVC DWV Pipe', 'Wye Fittings', 'P-Traps'], fasteners: ['Pipe Hangers', 'J-Hooks'], tools: ['Pipe Saw', 'Deburring Tool', 'Purple Primer', 'PVC Cement'], equipment: ['Water Pressure Test Rig'], crewRoles: ['Master Plumber', 'Journeyman Plumber'], specialistAgents: ['PLUMBING-SPECIALIST-01'] },
      spatialRequirements: { workZone: 'Zone-Plumbing-Core', installationEnvelope: 'Chase Envelope [20ft x 4ft x 10ft]', workerEnvelope: 'Clear Chase Width 3ft', toolEnvelope: 'Saw clearance 2ft', accessEnvelope: 'Under-floor Access 3ft', stagingArea: 'Plumbing Rack South', safetyClearance: 'Vapor ventilation mask during cementing' },
      sequence: [
        { operationId: 'OP-DWV-01', name: 'Layout Drain Slope Reference Lines (1/4" per foot slope)', primitiveAction: 'SNAP_LINE', sequenceOrder: 1, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Digital Inclinometer'], materialsRequired: [], tolerances: 'Min 1/4 inch per ft slope', verificationMethod: 'Inclinometer Test' },
        { operationId: 'OP-DWV-02', name: 'Cut, Deburr & Dry-Fit PVC Drain Stack & Branches', primitiveAction: 'CUT', sequenceOrder: 2, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['PVC Saw', 'Reamer'], materialsRequired: ['PVC Pipe'], tolerances: '+/- 1/8 inch length', verificationMethod: 'Dry Fit Check' },
        { operationId: 'OP-DWV-03', name: 'Apply Purple Primer and Solvent Cement Joinery', primitiveAction: 'SEAL', sequenceOrder: 3, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Applicator Brush'], materialsRequired: ['Purple Primer', 'Heavy-Duty PVC Cement'], tolerances: '1/4 turn twist join', verificationMethod: 'Full Purple Ring Verification' },
        { operationId: 'OP-DWV-04', name: 'Fasten Adjustable Pipe Hangers @ 4ft Intervals', primitiveAction: 'SUPPORT', sequenceOrder: 4, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Driver'], materialsRequired: ['Clevis Hangers', 'All-Thread'], tolerances: 'Max 4ft spacing', verificationMethod: 'Hanger Spacing Measure' },
        { operationId: 'OP-DWV-05', name: 'Fill System with Water & Execute 10ft Head Pressure Test', primitiveAction: 'TEST', sequenceOrder: 5, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Test Plug', 'Pressure Gauge'], materialsRequired: [], tolerances: 'Zero pressure drop in 15 mins', verificationMethod: 'Hydrostatic Pressure Test' },
        { operationId: 'OP-DWV-06', name: 'Plumbing Rough-In Plumbing Official Signoff', primitiveAction: 'INSPECT', sequenceOrder: 6, assignedActorType: 'INSPECTOR-PLUMB-01', toolsRequired: ['Gauge Verification'], materialsRequired: [], tolerances: '100% Leak Free', verificationMethod: 'Plumbing Permit Pass' }
      ],
      holdPoints: [{ holdPointId: 'HP-DWV-01', operationId: 'OP-DWV-06', description: 'Rough Plumbing Hydrostatic Water Test Signoff', requiredInspectorRole: 'INSPECTOR-PLUMB-01', releaseCriteria: '10ft head pressure holds 15 minutes without drop', isMandatory: true }],
      verifications: [{ verificationId: 'V-DWV-01', operationId: 'OP-DWV-01', parameterName: 'Horizontal Pipe Slope', expectedValue: '0.25 inches/ft', tolerance: '+/- 0.05 inches/ft', status: 'PENDING' }],
      handoff: { fromTradeRole: 'PLUMBING-SUPERINTENDENT-01', toTradeRole: 'DRYWALL-SUPERINTENDENT-01', releaseConditions: ['Hydrostatic test passed and signed off'], requiredSignoffRecords: ['PLUMB-ROUGH-PASSED-01'] },
      provenance: { knowledgeSource: 'Florida Plumbing Code 2023', codeReference: 'FPC 2023 Section 704', manufacturerReference: 'Charlotte Pipe Technical Manual', version: '1.0' }
    });

    // 7. WATER SUPPLY
    this.registerMethod({
      methodId: 'METHOD-WATER-01',
      name: 'CPVC / PEX Potable Water Distribution System',
      scope: 'PEX manifold layout, hot/cold branch runs, shutoff valves, pressure balance valves, and 100 PSI air test.',
      applicableAssemblies: ['ASSEMBLY-PLUMB-WATER-01'],
      applicableMaterials: ['SPEC-PEX-3-4IN', 'SPEC-PEX-1-2IN', 'SPEC-FITTING-CRIMP'],
      jurisdictionConstraints: ['Florida Plumbing Code 2023 Chapter 6', 'NSF/ANSI 61 Drinking Water'],
      environmentalConstraints: ['Protect PEX from direct UV exposure over 30 days'],
      prerequisites: { requiredPriorState: ['FRAMING_PASSED'], requiredSurveyControls: ['MANIFOLD_LOCATION_SET'], requiredGeometry: ['WALL_STUD_BORES_ALIGNED'], requiredInspectionRelease: ['DWV_PASSED'], requiredMaterialState: ['PEX_TUBING_DELIVERED'] },
      resources: { materials: ['3/4" Red/Blue PEX-a', '1/2" PEX-a', 'Copper Crimp Rings', 'Brass Valves'], fasteners: ['PEX Drop Ear Elbows', 'Nail Plates'], tools: ['PEX Expansion Tool', 'Crimp Gauge', 'Pressure Test Rig'], equipment: [], crewRoles: ['Plumber'], specialistAgents: ['PLUMBING-SPECIALIST-01'] },
      spatialRequirements: { workZone: 'Zone-Plumbing-Water', installationEnvelope: 'Wall Cavity [30ft x 8ft x 0.3ft]', workerEnvelope: 'Clear Stud Cavity 2ft', toolEnvelope: 'Expansion Tool Clearance 1.5ft', accessEnvelope: 'Utility Closet Access 3ft', stagingArea: 'Plumbing Rack South', safetyClearance: 'Shield PEX from hot electrical lines' },
      sequence: [
        { operationId: 'OP-WAT-01', name: 'Mount Master PEX Distribution Manifold', primitiveAction: 'PLACE', sequenceOrder: 1, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Screw Driver'], materialsRequired: ['PEX Manifold'], tolerances: 'Plumb & level', verificationMethod: 'Level Check' },
        { operationId: 'OP-WAT-02', name: 'Route Continuous PEX Runs Through Stud Bores with Protective Plates', primitiveAction: 'ROUTE', sequenceOrder: 2, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Drill Borer'], materialsRequired: ['PEX Tubing', 'Nail Plates'], tolerances: 'Min 1.25" edge clearance', verificationMethod: 'Nail Plate Check' },
        { operationId: 'OP-WAT-03', name: 'Crimp Connections at Fixture Drop Ears & Valves', primitiveAction: 'CONNECT', sequenceOrder: 3, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Expansion Tool', 'Go/No-Go Gauge'], materialsRequired: ['Brass Fittings', 'Crimp Rings'], tolerances: '100% Gauge Pass', verificationMethod: 'Crimp Gauge Inspection' },
        { operationId: 'OP-WAT-04', name: 'Pneumatic Pressure Test System @ 100 PSI Air for 30 Mins', primitiveAction: 'TEST', sequenceOrder: 4, assignedActorType: 'PLUMBER-ACTOR-01', toolsRequired: ['Air Compressor', 'Calibrated Gauge'], materialsRequired: [], tolerances: 'Zero PSI drop in 30 mins', verificationMethod: 'Pneumatic Gauge Audit' }
      ],
      holdPoints: [{ holdPointId: 'HP-WAT-01', operationId: 'OP-WAT-04', description: 'Potable Water Pressure Test Signoff', requiredInspectorRole: 'INSPECTOR-PLUMB-01', releaseCriteria: '100 PSI held 30 mins', isMandatory: true }],
      verifications: [{ verificationId: 'V-WAT-01', operationId: 'OP-WAT-04', parameterName: 'Test Pressure', expectedValue: '100 PSI', tolerance: '+/- 2 PSI', status: 'PENDING' }],
      handoff: { fromTradeRole: 'PLUMBING-SUPERINTENDENT-01', toTradeRole: 'DRYWALL-SUPERINTENDENT-01', releaseConditions: ['Pressure test passed'], requiredSignoffRecords: ['WATER-TEST-PASSED-01'] },
      provenance: { knowledgeSource: 'Florida Plumbing Code 2023', codeReference: 'FPC Section 604', manufacturerReference: 'Uponor PEX Design Manual', version: '1.0' }
    });

    // 8. ELECTRICAL BRANCH CIRCUIT
    this.registerMethod({
      methodId: 'METHOD-ELEC-01',
      name: 'Electrical Service Panel & Branch Circuit Wiring',
      scope: 'Main breaker panel mounting, NM-B (Romex) cable routing, junction boxes, outlet/switch rough-in, grounding electrode, and insulation resistance testing.',
      applicableAssemblies: ['ASSEMBLY-ELEC-PANEL-01'],
      applicableMaterials: ['SPEC-WIRE-ROMEX-12-2', 'SPEC-BOX-PLASTIC-2G', 'SPEC-BREAKER-20A'],
      jurisdictionConstraints: ['NFPA 70 National Electrical Code (NEC) 2020', 'FBC 2023 Building Section 2701'],
      environmentalConstraints: ['Dry environment during cable pulling', 'De-energized panel during rough installation'],
      prerequisites: { requiredPriorState: ['FRAMING_PASSED', 'ROOF_DRYIN_PASSED'], requiredSurveyControls: ['OUTLET_HEIGHTS_MARKED'], requiredGeometry: ['STUD_BORES_ALIGNED'], requiredInspectionRelease: ['FRAMING_RELEASE'], requiredMaterialState: ['CABLE_BOXES_STAGED'] },
      resources: { materials: ['12/2 NM-B Wire', '200A Main Panel', '2-Gang Outlet Boxes', '20A AFCI/GFCI Breakers'], fasteners: ['Cable Staples', 'Ground Screws'], tools: ['Wire Stripper', 'Cable Puller', 'Lineman Pliers', 'Megohmmeter'], equipment: [], crewRoles: ['Master Electrician', 'Journeyman Electrician'], specialistAgents: ['ELECTRICAL-SPECIALIST-01'] },
      spatialRequirements: { workZone: 'Zone-Elec-Panel', installationEnvelope: 'Panel Zone [3ft x 6ft x 3ft]', workerEnvelope: 'Working Space Depth 36 inches (NEC 110.26)', toolEnvelope: 'Wire Puller Radius 4ft', accessEnvelope: 'Clear Access Width 30 inches', stagingArea: 'Electrical Rack East', safetyClearance: 'Lockout/Tagout mandatory during panel work' },
      sequence: [
        { operationId: 'OP-ELEC-01', name: 'Mount 200A Main Breaker Panel & Grounding Electrode', primitiveAction: 'PLACE', sequenceOrder: 1, assignedActorType: 'ELECTRICIAN-ACTOR-01', toolsRequired: ['Level', 'Impact Screwdriver'], materialsRequired: ['200A Panel', 'Ground Rod'], tolerances: 'Plumb & level', verificationMethod: 'Level & Grounding Resistance Check (<25 ohms)' },
        { operationId: 'OP-ELEC-02', name: 'Mount Wall Outlet & Switch Junction Boxes @ Code Heights', primitiveAction: 'PLACE', sequenceOrder: 2, assignedActorType: 'ELECTRICIAN-ACTOR-01', toolsRequired: ['Hammer'], materialsRequired: ['2-Gang Plastic Box', 'Nails'], tolerances: '18" outlet / 48" switch height', verificationMethod: 'Height Tape Measurement' },
        { operationId: 'OP-ELEC-03', name: 'Pull 12/2 NM-B Cable Through Bored Studs & Secure with Staples', primitiveAction: 'ROUTE', sequenceOrder: 3, assignedActorType: 'ELECTRICIAN-ACTOR-01', toolsRequired: ['Cable Puller', 'Stapler'], materialsRequired: ['12/2 NM-B', 'Cable Staples'], tolerances: 'Staples within 8" of box / 4.5ft field', verificationMethod: 'Staple Spacing Audit' },
        { operationId: 'OP-ELEC-04', name: 'Strip Outer Jacket, Make Ground Connections & Wire-Nut Conductors', primitiveAction: 'CONNECT', sequenceOrder: 4, assignedActorType: 'ELECTRICIAN-ACTOR-01', toolsRequired: ['Wire Strippers', 'Lineman Pliers'], materialsRequired: ['Wire Nuts', 'Grounding Clips'], tolerances: 'Minimum 6" conductor length in box', verificationMethod: 'Visual Conductor Inspection' },
        { operationId: 'OP-ELEC-05', name: 'Execute Megohmmeter (Megger) 1000V Insulation Resistance Test', primitiveAction: 'TEST', sequenceOrder: 5, assignedActorType: 'ELECTRICIAN-ACTOR-01', toolsRequired: ['Megohmmeter'], materialsRequired: [], tolerances: '> 50 Megohms insulation resistance', verificationMethod: 'Megger Certificate' },
        { operationId: 'OP-ELEC-06', name: 'Rough Electrical Inspector Signoff', primitiveAction: 'INSPECT', sequenceOrder: 6, assignedActorType: 'INSPECTOR-ELEC-01', toolsRequired: ['Inspection Meter'], materialsRequired: [], tolerances: 'NEC 2020 Compliant', verificationMethod: 'Electrical Rough Permit Pass' }
      ],
      holdPoints: [{ holdPointId: 'HP-ELEC-01', operationId: 'OP-ELEC-06', description: 'Rough Electrical Inspection Signoff Before Insulation', requiredInspectorRole: 'INSPECTOR-ELEC-01', releaseCriteria: 'All wiring stapled, box grounds tied, megger test passed', isMandatory: true }],
      verifications: [{ verificationId: 'V-ELEC-01', operationId: 'OP-ELEC-05', parameterName: 'Insulation Resistance', expectedValue: '100 M-Ohms', tolerance: '> 50 M-Ohms', status: 'PENDING' }],
      handoff: { fromTradeRole: 'ELECTRICAL-SUPERINTENDENT-01', toTradeRole: 'INSULATION-SUPERINTENDENT-01', releaseConditions: ['Rough electrical inspector signoff completed'], requiredSignoffRecords: ['ELEC-ROUGH-PASSED-01'] },
      provenance: { knowledgeSource: 'NFPA 70 National Electrical Code 2020', codeReference: 'NEC Article 334 (NM Cable) / NEC 110.26', manufacturerReference: 'Square D Schneider Panel Spec', version: '1.0' }
    });

    // 9. HVAC SUPPLY / RETURN BRANCH
    this.registerMethod({
      methodId: 'METHOD-HVAC-01',
      name: 'HVAC Air Handler & Ductwork Distribution Assembly',
      scope: 'Heat pump air handler unit setup, R-8 flex duct branches, rigid trunk line, supply registers, return grilles, condensate drain line, and duct leakage smoke test.',
      applicableAssemblies: ['ASSEMBLY-HVAC-DUCT-01'],
      applicableMaterials: ['SPEC-DUCT-FLEX-R8', 'SPEC-CANVAS-MASTIC', 'SPEC-UNIT-AHU-3TON'],
      jurisdictionConstraints: ['Florida Mechanical Code 2023 Chapter 6', 'ASHRAE 62.2 Ventilation Standard'],
      environmentalConstraints: ['Maintain clean duct interior during storage and assembly'],
      prerequisites: { requiredPriorState: ['FRAMING_PASSED', 'ROOF_DRYIN_PASSED'], requiredSurveyControls: ['REGISTER_LOCATIONS_MARKED'], requiredGeometry: ['JOIST_BAYS_CLEAR'], requiredInspectionRelease: ['FRAMING_RELEASE'], requiredMaterialState: ['DUCTWORK_UNCOILED_INSPECTED'] },
      resources: { materials: ['3-Ton Air Handler', 'R-8 Flexible Duct', 'Galvanized Sheet Metal Trunk', 'Mastic Sealant'], fasteners: ['Draw Bands', 'Sheet Metal Screws', 'Duct Strap'], tools: ['Duct Crimper', 'Mastic Brush', 'Duct Blaster Tester'], equipment: [], crewRoles: ['HVAC Technician', 'Sheet Metal Worker'], specialistAgents: ['HVAC-SPECIALIST-01'] },
      spatialRequirements: { workZone: 'Zone-HVAC-Attic', installationEnvelope: 'Attic Mechanical Space [20ft x 15ft x 6ft]', workerEnvelope: 'Attic Access Clearance 30" x 30"', toolEnvelope: 'Duct Crimper Radius 2ft', accessEnvelope: 'Passageway 24" wide with continuous flooring', stagingArea: 'Garage Staging North', safetyClearance: 'Service platform 30" wide in front of unit' },
      sequence: [
        { operationId: 'OP-HVAC-01', name: 'Position & Mount 3-Ton Air Handler on Vibration Isolators', primitiveAction: 'PLACE', sequenceOrder: 1, assignedActorType: 'HVAC-ACTOR-01', toolsRequired: ['Level'], materialsRequired: ['Air Handler Unit', 'Rubber Pads'], tolerances: 'Level within 1/8 inch', verificationMethod: 'Unit Level Check' },
        { operationId: 'OP-HVAC-02', name: 'Assemble Sheet Metal Trunk & Coat Seams with Foil Tape & Mastic', primitiveAction: 'SEAL', sequenceOrder: 2, assignedActorType: 'HVAC-ACTOR-01', toolsRequired: ['Mastic Brush', 'Crimper'], materialsRequired: ['Galvanized Trunk', 'Mastic', 'Foil Tape'], tolerances: 'Zero visible air gaps', verificationMethod: 'Mastic Thickness Gauge' },
        { operationId: 'OP-HVAC-03', name: 'Route R-8 Flex Duct Branches to Ceiling Boots & Secure with Nylon Straps', primitiveAction: 'ROUTE', sequenceOrder: 3, assignedActorType: 'HVAC-ACTOR-01', toolsRequired: ['Tensioning Tool'], materialsRequired: ['R-8 Flex Duct', 'Nylon Draw Bands'], tolerances: 'Max 4ft sag / 4ft strap spacing', verificationMethod: 'Sag Inspection' },
        { operationId: 'OP-HVAC-04', name: 'Install Condensate Drain Line with Trap & Secondary Float Switch', primitiveAction: 'CONNECT', sequenceOrder: 4, assignedActorType: 'HVAC-ACTOR-01', toolsRequired: ['PVC Cutter'], materialsRequired: ['3/4 PVC Pipe', 'Float Switch'], tolerances: '1/8" per foot slope', verificationMethod: 'Water Flow Drainage Test' },
        { operationId: 'OP-HVAC-05', name: 'Execute Duct Blaster Leakage Test @ 25 Pa', primitiveAction: 'TEST', sequenceOrder: 5, assignedActorType: 'HVAC-ACTOR-01', toolsRequired: ['Duct Blaster Fan & Gauge'], materialsRequired: [], tolerances: 'Total leakage < 4 CFM / 100 sq ft', verificationMethod: 'Duct Blaster Certification' }
      ],
      holdPoints: [{ holdPointId: 'HP-HVAC-01', operationId: 'OP-HVAC-05', description: 'Duct Leakage & Mechanical Rough Signoff', requiredInspectorRole: 'INSPECTOR-HVAC-01', releaseCriteria: 'Duct Blaster test passes energy code threshold', isMandatory: true }],
      verifications: [{ verificationId: 'V-HVAC-01', operationId: 'OP-HVAC-05', parameterName: 'Duct Air Leakage Rate', expectedValue: '3.2 CFM/100 sqft', tolerance: '< 4.0 CFM/100 sqft', status: 'PENDING' }],
      handoff: { fromTradeRole: 'HVAC-SUPERINTENDENT-01', toTradeRole: 'INSULATION-SUPERINTENDENT-01', releaseConditions: ['Mechanical rough inspection passed'], requiredSignoffRecords: ['MECH-ROUGH-PASSED-01'] },
      provenance: { knowledgeSource: 'Florida Building Code Mechanical 2023', codeReference: 'FBC Mechanical Section 603', manufacturerReference: 'Carrier Air Handler Service Manual', version: '1.0' }
    });

    // 10. BUILDING ENVELOPE / WATERPROOFING
    this.registerMethod({
      methodId: 'METHOD-ENVELOPE-01',
      name: 'Exterior Weather Barrier, Flashing & Window Integration',
      scope: 'Housewrap weather-resistive barrier, window sill pan flashing, nail flange sealing, and WRB tape integration.',
      applicableAssemblies: ['ASSEMBLY-ENVELOPE-WRB-01'],
      applicableMaterials: ['SPEC-HOUSEWRAP-TYVEK', 'SPEC-FLASHING-BUTYL', 'SPEC-SEALANT-POLYURETHANE'],
      jurisdictionConstraints: ['FBC 2023 Building Section 1403', 'ASTM E2112 Standard for Window Installation'],
      environmentalConstraints: ['Apply flashing tapes above 35F ambient temperature'],
      prerequisites: { requiredPriorState: ['EXTERIOR_WALL_FRAMING_PASSED'], requiredSurveyControls: ['WINDOW_ROUGH_OPENINGS_VERIFIED'], requiredGeometry: ['SHEATHING_FLUSH'], requiredInspectionRelease: ['FRAMING_RELEASE'], requiredMaterialState: ['WRB_ROLLS_STAGED'] },
      resources: { materials: ['Tyvek Commercial Wrap', 'Butyl Flashing Tape 6"', 'Polyurethane Sealant', 'Vinyl Flanged Windows'], fasteners: ['Cap Nails', 'Stainless Steel Screws'], tools: ['J-Roller', 'Cap Stapler', 'Caulking Gun'], equipment: [], crewRoles: ['Envelope Specialist', 'Window Installer'], specialistAgents: ['BUILDING-ENVELOPE-SPECIALIST-01'] },
      spatialRequirements: { workZone: 'Zone-Envelope-Perimeter', installationEnvelope: 'Exterior Surface Area [1200 sqft]', workerEnvelope: 'Scaffold Platform 3ft wide', toolEnvelope: 'Roller Clearance 1ft', accessEnvelope: 'Perimeter Scaffold Path 4ft', stagingArea: 'Ground Staging West', safetyClearance: 'Fall protection tie-off above 6ft' },
      sequence: [
        { operationId: 'OP-ENV-01', name: 'Wrap Exterior Sheathing with Weather-Resistive Barrier (WRB)', primitiveAction: 'PLACE', sequenceOrder: 1, assignedActorType: 'ENVELOPE-ACTOR-01', toolsRequired: ['Cap Stapler'], materialsRequired: ['Tyvek Wrap', 'Cap Staples'], tolerances: 'Shingle-lap 6" horizontal / 12" vertical', verificationMethod: 'Overlap Inspection' },
        { operationId: 'OP-ENV-02', name: 'Install Sloped Sill Pan Flashing Tape with Flex Corners', primitiveAction: 'ADHERE', sequenceOrder: 2, assignedActorType: 'ENVELOPE-ACTOR-01', toolsRequired: ['J-Roller'], materialsRequired: ['6" Butyl Flashing Tape'], tolerances: 'Zero air bubbles under tape', verificationMethod: 'Roller Adhesion Verification' },
        { operationId: 'OP-ENV-03', name: 'Set Vinyl Window into Openings with Continuous Polyurethane Sealant Bead', primitiveAction: 'SEAL', sequenceOrder: 3, assignedActorType: 'WINDOW-ACTOR-01', toolsRequired: ['Caulking Gun'], materialsRequired: ['Vinyl Window', 'Polyurethane Sealant'], tolerances: 'Continuous 3/8" bead', verificationMethod: 'Bead Continuity Check' },
        { operationId: 'OP-ENV-04', name: 'Plumb, Square & Fasten Window Flange to Framing', primitiveAction: 'FASTEN', sequenceOrder: 4, assignedActorType: 'WINDOW-ACTOR-01', toolsRequired: ['Impact Driver'], materialsRequired: ['Stainless Steel Screws'], tolerances: 'Diagonal square within 1/16"', verificationMethod: 'Diagonal Measure' },
        { operationId: 'OP-ENV-05', name: 'Apply Side & Head Flashing Tapes over Window Flanges', primitiveAction: 'ADHERE', sequenceOrder: 5, assignedActorType: 'ENVELOPE-ACTOR-01', toolsRequired: ['J-Roller'], materialsRequired: ['Butyl Flashing Tape'], tolerances: 'Shingle lap integration over WRB', verificationMethod: 'Water-Shedding Drainage Inspection' }
      ],
      holdPoints: [{ holdPointId: 'HP-ENV-01', operationId: 'OP-ENV-05', description: 'Building Envelope & Window Flashing Inspection', requiredInspectorRole: 'INSPECTOR-ENVELOPE-01', releaseCriteria: 'All window flashings integrated, WRB sealed', isMandatory: true }],
      verifications: [{ verificationId: 'V-ENV-01', operationId: 'OP-ENV-05', parameterName: 'Flashing Adhesion Pressure', expectedValue: '100% Bonded', tolerance: 'Zero gaps/bubbles', status: 'PENDING' }],
      handoff: { fromTradeRole: 'ENVELOPE-SUPERINTENDENT-01', toTradeRole: 'SIDING-SUPERINTENDENT-01', releaseConditions: ['Envelope inspection passed'], requiredSignoffRecords: ['ENVELOPE-PASSED-01'] },
      provenance: { knowledgeSource: 'FBC Exterior Envelopes Chapter 14', codeReference: 'FBC 2023 Section 1403.2', manufacturerReference: 'DuPont Tyvek Weatherization Spec', version: '1.0' }
    });
  }

  public static registerMethod(method: ConstructionMethodRecord): void {
    this.methods.set(method.methodId, method);
  }

  public static getMethodGraph(methodId: string): ConstructionMethodRecord | undefined {
    this.initialize();
    return this.methods.get(methodId);
  }

  public static getAllMethods(): ConstructionMethodRecord[] {
    this.initialize();
    return Array.from(this.methods.values());
  }

  public static recordSpatialAction(action: Omit<SpatialActionRecord, 'id' | 'timestamp'>): SpatialActionRecord {
    const record: SpatialActionRecord = {
      id: `SPATIAL-ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...action
    };
    this.spatialActions.push(record);
    return record;
  }

  public static getSpatialActions(): SpatialActionRecord[] {
    return [...this.spatialActions];
  }
}
