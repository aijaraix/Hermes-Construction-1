# HERMES EMBODIED ACTOR + ROBOTICS ARCHITECTURE

**Status:** Planning specification  
**Purpose:** Define one hardware-neutral actor contract that works for simulated humans, vehicles, construction equipment, and future physical robots.

## 1. Principle

HERMES should not have one digital-agent world and a separate future robot world.

Use one canonical world/task model.

Digital actors simulate execution now.

Future physical actors consume the same mission, geometry, work-zone, material, and task abstractions.

## 2. Actor classes

Common actor contract supports:

- human worker;
- supervisor/inspector;
- wheeled robot;
- legged robot;
- manipulator;
- drone;
- forklift;
- excavator;
- crane;
- truck;
- specialized autonomous construction machine.

Each class adds capabilities without replacing the common identity/spatial contract.

## 3. Actor identity

Required:

- actorId;
- actorClass;
- assignedAgentRoleId;
- organization/manager;
- projectId;
- homeBase;
- currentMissionId;
- currentTaskId;
- authority level.

Separate:

- **reasoning agent** — decides/plans;
- **embodied actor** — exists/acts in physical space.

A reasoning role may control zero, one, or multiple embodied actors.

## 4. Pose and localization

Canonical actor pose:

- world position;
- quaternion orientation;
- linear velocity;
- angular velocity where relevant;
- world frame ID;
- timestamp;
- localization confidence;
- observation source.

For simulation, confidence may be 1.0.

For real hardware, confidence reflects localization uncertainty.

## 5. Body geometry

Represent:

- nominal body envelope;
- collision envelope;
- articulated segments if relevant;
- wheelbase/track;
- turning radius;
- ground clearance;
- maximum height/width states;
- reachable workspace.

Do not require full high-fidelity kinematics for every Academy actor.

Use fidelity appropriate to task.

## 6. Tool contract

A tool is a spatial capability.

Tool record:

- toolId;
- type;
- mount/attachment frame;
- mass;
- dimensions;
- operating envelope;
- operating states;
- required energy;
- supported operations;
- hazard zone;
- calibration state.

Examples:

- nail gun;
- drill;
- saw;
- excavator bucket;
- concrete pump boom;
- welding head;
- gripper;
- total station.

Attaching a tool changes effective geometry/capability.

## 7. Payload contract

Payload record:

- payload/component/material ID;
- mass;
- dimensions/profile;
- pose relative to actor;
- grasp/attachment points;
- rigidity/flexibility;
- center of mass when known;
- allowed orientations;
- fragile/hazardous properties.

Effective moving geometry:

`actor + articulation + tool + payload + safety margin`

A route valid for an empty actor may be invalid when loaded.

## 8. Mobility contract

Capabilities may include:

- wheeled;
- tracked;
- legged;
- flying;
- stationary manipulator;
- crane/boom;
- human walking.

Parameters:

- max speed;
- max acceleration;
- turn radius;
- climb/slope;
- step height;
- minimum ground bearing;
- terrain classes;
- indoor/outdoor;
- doorway clearance;
- payload-dependent derating.

## 9. Manipulation contract

For actors that handle objects:

- reach;
- working envelope;
- payload limit;
- gripper/tool types;
- grasp modes;
- placement tolerance;
- lift height;
- orientation constraints;
- force capability;
- supported material classes.

HERMES needs task-level manipulation constraints.

Robot-local software handles exact joint trajectories.

## 10. Sensor contract

Future-capable sensor types:

- RGB camera;
- stereo/depth;
- LiDAR;
- IMU;
- GNSS/RTK;
- wheel odometry;
- joint encoders;
- force/torque;
- proximity;
- thermal;
- acoustic;
- survey instruments.

Sensor record:

- sensorId;
- type;
- frame;
- field of view/range;
- resolution/accuracy;
- update rate;
- health;
- calibration;
- data endpoint/reference.

HERMES should consume structured observations, not raw sensor streams by default.

## 11. Energy/health contract

Physical actor state should allow:

- battery/fuel;
- estimated runtime;
- temperature;
- faults;
- degraded capabilities;
- maintenance due;
- connectivity health;
- emergency-stop status.

Mission planning must eventually consider these constraints.

## 12. Actor operating states

Standard states:

- OFFLINE;
- IDLE;
- READY;
- MOVING;
- POSITIONING;
- PICKING;
- CARRYING;
- INSTALLING;
- INSPECTING;
- WAITING;
- BLOCKED;
- PAUSED;
- UNSAFE;
- FAULT;
- CHARGING/REFUELING;
- MAINTENANCE.

State transitions must be auditable.

## 13. Mission contract

HERMES Prime/director assigns missions, not motor commands.

Example mission:

```
DELIVER_AND_STAGE
payload: MAT-LONG-LVL-01
pickup: LAYDOWN-ZONE
destination: ROOM-204-STAGING
completeBefore: ENCLOSE_BUILDING...
constraints:
  preservePayloadOrientation
  avoidActiveWorkZones
  minimumClearance
```

Mission includes:

- missionId;
- taskId;
- actor;
- objective;
- start/goal;
- object/payload;
- deadline/dependency;
- spatial constraints;
- safety constraints;
- required evidence;
- completion condition.

## 14. Control hierarchy

```
HERMES PRIME
  ↓
Discipline / Construction Operations Director
  ↓
Site Coordinator
  ↓
Mission Planner
  ↓
Actor Adapter / Robot Computer
  ↓
Local Motion Planner
  ↓
Real-Time Safety Controller
  ↓
Motors / Hydraulics / Tools
```

Telemetry/evidence flows upward.

## 15. Hard safety boundary

LLM/model output must never directly command actuators.

Required future physical execution chain:

`model proposal → deterministic validation → mission authorization → local planner → safety controller → actuator`

Safety controller has veto authority.

Emergency stop never depends on cloud/model availability.

## 16. Human actors

Humans remain first-class embodied actors.

Human contract may include:

- role/trade;
- certifications;
- assigned tools;
- work envelope;
- PPE requirements;
- shift/availability;
- manual-carry limits;
- restricted zones.

This lets HERMES coordinate mixed human/robot sites during transition to automation.

## 17. Equipment actors

Heavy equipment needs specialized geometry.

Examples:

### Excavator
- base envelope;
- cab;
- boom/stick/bucket envelopes;
- swing radius;
- ground bearing;
- reach/depth.

### Crane
- base/outriggers;
- boom;
- swing;
- load;
- suspended-load exclusion zone.

### Forklift
- chassis;
- fork/load envelope;
- mast height;
- turning radius.

Use simplified deterministic envelopes before full kinematics.

## 18. Digital twin adapter

Every physical actor should map into the same simulated contract.

Modes:

- SIMULATED;
- SHADOW;
- HARDWARE_IN_LOOP;
- PHYSICAL.

The rest of HERMES should not need a completely different mission schema for each mode.

## 19. Robot adapter interface

Future adapter responsibilities:

- accept authorized mission;
- translate world frame;
- report capabilities;
- report pose/telemetry;
- request route/replan;
- report progress;
- report observation/evidence;
- report fault;
- complete/abort mission.

Possible protocols later:

- ROS 2;
- vendor SDK;
- OPC UA;
- MQTT;
- gRPC;
- custom edge API.

Do not hard-code HERMES to one robotics vendor.

## 20. Site computer architecture

Future construction site may use:

- central HERMES service;
- site edge computer;
- robot-local computer;
- fixed sensors/cameras.

Site edge computer can provide:

- local map cache;
- perception;
- low-latency coordination;
- local inference;
- offline resilience;
- observation aggregation.

Cloud/central HERMES keeps project-level state/governance.

## 21. Telemetry event contract

Telemetry should not overwrite canonical project state blindly.

Events:

- POSE_UPDATE;
- MISSION_STARTED;
- MISSION_PROGRESS;
- PAYLOAD_PICKED;
- PAYLOAD_PLACED;
- TOOL_STATE_CHANGED;
- OBSERVATION_REPORTED;
- BLOCKED;
- FAULT;
- SAFETY_STOP;
- MISSION_COMPLETED.

Promote physical construction state only after appropriate evidence/validation.

## 22. Progressive Academy embodiment curriculum

### Stage A
Perfect simulated pose and known obstacles.

### Stage B
Payload changes geometry.

### Stage C
Dynamic actors and work zones.

### Stage D
Sensor/localization uncertainty.

### Stage E
Unexpected obstacle/replan.

### Stage F
Tool failure / low energy.

### Stage G
Human/robot mixed site.

### Stage H
Hardware-in-loop.

### Stage I
Supervised physical execution.

## 23. First robotics-adjacent proof

Do not buy/build a construction robot first.

Prove adapter architecture with a simulated actor that:

1. receives mission;
2. requests/uses HERMES route;
3. moves through canonical world;
4. carries a payload;
5. reports telemetry;
6. detects blocked route;
7. replans;
8. stages payload;
9. produces completion evidence.

Then the same mission interface can be attached to a robot simulator/hardware adapter.

## 24. Acceptance rules

Robotics-ready means:

- hardware-neutral contracts exist;
- spatial frames are explicit;
- payload/tool geometry matters;
- missions are deterministic/structured;
- safety boundary is explicit;
- telemetry can reconcile world state.

It does **not** mean real construction robots are already safe or certified.
